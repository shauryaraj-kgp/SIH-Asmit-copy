"""
OpenStreetMap (OSM) data collection service for DisasterLens AI.
This service uses overpy and osmnx to collect pre-disaster data for a location.
"""

import overpy
import osmnx as ox
import geopandas as gpd
import json
import os
from typing import List, Dict, Any, Optional
import logging
import time
import random

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class OSMService:
    def __init__(self):
        self.api = overpy.Overpass()
        
    def collect_poi_data(self, area_name: str, structures: List[str] = None) -> Dict[str, List[Dict[str, Any]]]:
        """
        Collect Points of Interest (POIs) from OpenStreetMap for a given area.
        
        Args:
            area_name: Name of the area to search (city, district, etc.)
            structures: List of structure types to search for (e.g., "hospital", "school")
                        If None, defaults to ["hospital", "school", "shelter", "fire_station", "police"]
        
        Returns:
            Dictionary with structure types as keys and lists of POIs as values
        """
        if structures is None:
            structures = ["hospital", "school", "shelter", "fire_station", "police"]
        
        results = {}
        
        for structure in structures:
            try:
                logger.info(f"Collecting {structure} data for {area_name}")
                
                # Try simpler query format first with proper timeout
                query = self._build_improved_query(area_name, structure)
                
                # Add retry mechanism to handle transient errors
                max_retries = 3
                retry_count = 0
                
                while retry_count < max_retries:
                    try:
                        osm_result = self.api.query(query)
                        break  # Success - exit retry loop
                    except Exception as e:
                        retry_count += 1
                        if retry_count >= max_retries:
                            logger.warning(f"Failed after {max_retries} attempts for {structure} data")
                            raise e
                        logger.info(f"Retry {retry_count}/{max_retries} for {structure} data")
                        time.sleep(1 + random.random())  # Add jitter to prevent thundering herd
                
                # Process nodes
                poi_list = []
                for node in osm_result.nodes:
                    poi = {
                        "id": f"node_{node.id}",
                        "name": node.tags.get("name", f"Unnamed {structure.capitalize()}"),
                        "type": structure,
                        "latitude": float(node.lat),
                        "longitude": float(node.lon),
                        "details": self._extract_details(node.tags),
                        "status": "active",
                        "lastUpdated": self._get_last_update_date()
                    }
                    poi_list.append(poi)
                
                # Process ways (for larger structures like hospitals that may be outlined)
                for way in osm_result.ways:
                    # Handle ways with center attribute
                    if "center" in way.attributes:
                        lat = float(way.attributes["center"]["lat"])
                        lon = float(way.attributes["center"]["lon"])
                    else:
                        # Calculate centroid if center is not provided and way has nodes
                        if way.nodes and len(way.nodes) > 0:
                            coords = [(float(node.lat), float(node.lon)) for node in way.nodes]
                            if coords:
                                lat = sum(c[0] for c in coords) / len(coords)
                                lon = sum(c[1] for c in coords) / len(coords)
                            else:
                                continue
                        else:
                            continue
                    
                    poi = {
                        "id": f"way_{way.id}",
                        "name": way.tags.get("name", f"Unnamed {structure.capitalize()}"),
                        "type": structure,
                        "latitude": lat,
                        "longitude": lon, 
                        "details": self._extract_details(way.tags),
                        "status": "active",
                        "lastUpdated": self._get_last_update_date()
                    }
                    poi_list.append(poi)
                
                # Add any relations with center coordinates
                for rel in osm_result.relations:
                    # Skip relations without center coordinates
                    if "center" not in rel.attributes:
                        continue
                        
                    lat = float(rel.attributes["center"]["lat"])
                    lon = float(rel.attributes["center"]["lon"])
                    
                    poi = {
                        "id": f"relation_{rel.id}",
                        "name": rel.tags.get("name", f"Unnamed {structure.capitalize()}"),
                        "type": structure,
                        "latitude": lat,
                        "longitude": lon, 
                        "details": self._extract_details(rel.tags),
                        "status": "active",
                        "lastUpdated": self._get_last_update_date()
                    }
                    poi_list.append(poi)
                
                results[structure] = poi_list
                logger.info(f"Found {len(poi_list)} {structure}(s) in {area_name}")
                
            except Exception as e:
                logger.error(f"Error collecting {structure} data for {area_name}: {str(e)}")
                # Make sure we include an empty list even when errors occur
                results[structure] = []
        
        return results
    
    def collect_boundary_data(self, location: str) -> Optional[Dict[str, Any]]:
        """
        Collect boundary data for a location and save it as GeoJSON.
        
        Args:
            location: Full location name (e.g., "Alappuzha, Kerala, India")
            
        Returns:
            Dictionary with boundary information or None if not found
        """
        try:
            # Create data directory if it doesn't exist
            os.makedirs("data/boundaries", exist_ok=True)
            
            # Clean the location name to create a valid filename
            clean_name = location.replace(", ", "_").replace(" ", "_").lower()
            file_path = f"data/boundaries/{clean_name}_boundary.geojson"
            
            # Check if the boundary file already exists
            if os.path.exists(file_path):
                logger.info(f"Using cached boundary data for {location}")
                gdf = gpd.read_file(file_path)
            else:
                logger.info(f"Downloading boundary data for {location}")
                gdf = ox.geocode_to_gdf(location)
                
                # Project to a suitable CRS for area calculation (e.g., UTM)
                try:
                    # Try to determine appropriate UTM zone based on centroid
                    centroid = gdf.unary_union.centroid
                    utm_crs = self._get_utm_crs(centroid.y, centroid.x)
                    gdf_projected = gdf.to_crs(utm_crs)
                    area_sqkm = round(gdf_projected.area.sum() / 1e6, 2)
                except Exception:
                    # Fallback if projection fails
                    area_sqkm = round(gdf.area.sum() / 1e6, 2)
                    logger.warning("Using geographic CRS for area calculation; results may be approximate")
                
                # Save to GeoJSON
                gdf.to_file(file_path, driver="GeoJSON")
            
            # Extract and return basic information
            boundary_info = {
                "name": location,
                "file_path": file_path,
                "area_sqkm": area_sqkm,
                "bbox": gdf.total_bounds.tolist()
            }
            
            return boundary_info
            
        except Exception as e:
            logger.error(f"Error collecting boundary data for {location}: {str(e)}")
            return None
    
    def _build_improved_query(self, area_name: str, structure: str) -> str:
        """Build an improved Overpass QL query for a specific area and structure type"""
        # For structures that are typically tagged with amenity
        amenity_structures = ["hospital", "school", "shelter", "fire_station", "police"]
        
        if structure in amenity_structures:
            return f"""
                [out:json][timeout:60];
                area["name"="{area_name}"][admin_level~"."]->.searchArea;
                (
                  node["amenity"="{structure}"](area.searchArea);
                  way["amenity"="{structure}"](area.searchArea);
                  relation["amenity"="{structure}"](area.searchArea);
                );
                out center;
            """
        # For infrastructure like water sources or power substations
        elif structure == "water":
            return f"""
                [out:json][timeout:60];
                area["name"="{area_name}"][admin_level~"."]->.searchArea;
                (
                  node["man_made"~"water_tower|water_well|water_works"](area.searchArea);
                  way["man_made"~"water_tower|water_works"](area.searchArea);
                  node["natural"="water"](area.searchArea);
                  way["natural"="water"](area.searchArea);
                );
                out center;
            """
        elif structure == "power":
            return f"""
                [out:json][timeout:60];
                area["name"="{area_name}"][admin_level~"."]->.searchArea;
                (
                  node["power"~"substation|plant|generator"](area.searchArea);
                  way["power"~"substation|plant|generator"](area.searchArea);
                );
                out center;
            """
        else:
            # Generic query for other structure types
            return f"""
                [out:json][timeout:60];
                area["name"="{area_name}"][admin_level~"."]->.searchArea;
                (
                  node["{structure}"](area.searchArea);
                  way["{structure}"](area.searchArea);
                  relation["{structure}"](area.searchArea);
                );
                out center;
            """
    
    def _get_utm_crs(self, lat: float, lon: float) -> int:
        """Determine the UTM CRS code based on latitude and longitude"""
        # UTM zones are 6 degrees wide
        zone_number = int((lon + 180) / 6) + 1
        
        # Northern or southern hemisphere
        epsg = 32600 + zone_number if lat >= 0 else 32700 + zone_number
        
        return f"EPSG:{epsg}"
    
    def _extract_details(self, tags: Dict[str, str]) -> str:
        """Extract useful details from OSM tags"""
        details = []
        
        # Add important/common tags to the details
        important_tags = ["capacity", "beds", "operator", "emergency", "healthcare", 
                          "building", "levels", "water_supply", "generator:source",
                          "phone", "contact:phone", "website", "contact:website"]
        
        for tag, value in tags.items():
            if tag in important_tags and value:
                details.append(f"{tag.replace('_', ' ').title()}: {value}")
        
        # If no important tags found, use description or name as fallback
        if not details:
            if "description" in tags:
                return tags["description"]
            elif "name" in tags:
                return f"Name: {tags['name']}"
            return "No detailed information available"
            
        return ". ".join(details)
    
    def _get_last_update_date(self) -> str:
        """Return current date as last update date in ISO format"""
        from datetime import datetime
        return datetime.now().isoformat()