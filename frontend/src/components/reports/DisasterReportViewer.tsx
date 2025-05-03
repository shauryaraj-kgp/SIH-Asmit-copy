import { useState } from 'react';
import { 
  Box, Paper, Typography, Divider, IconButton,
  Chip, Button, Tooltip, CircularProgress,
  Alert, Link, Card, CardContent
} from '@mui/material';
import {
  ContentCopy, SaveAlt, Print, Share,
  Article, Public, Launch, Info
} from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';

import { DisasterReport } from '../../services/postDisasterService';

// Define props for the component
interface DisasterReportViewerProps {
  report?: DisasterReport;
  loading?: boolean;
  error?: string;
  onSourceClick?: (url: string) => void;
}

export default function DisasterReportViewer({
  report,
  loading = false,
  error,
  onSourceClick
}: DisasterReportViewerProps) {
  const [copiedAlert, setCopiedAlert] = useState(false);
  
  if (loading) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <CircularProgress size={48} thickness={4} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Generating disaster report...
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          This may take a minute as we analyze multiple sources
        </Typography>
      </Paper>
    );
  }
  
  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        <Typography variant="subtitle1">Failed to generate report</Typography>
        <Typography variant="body2">{error}</Typography>
      </Alert>
    );
  }
  
  if (!report) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Article fontSize="large" color="action" sx={{ fontSize: 48, opacity: 0.5, mb: 2 }} />
        <Typography variant="h6">
          No report available
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Use the form above to generate a disaster report
        </Typography>
      </Paper>
    );
  }
  
  // Format dates for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown date';
    if (dateString === 'present') return 'Present';
    if (dateString === 'past year') return 'Past Year';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch (e) {
      return dateString;
    }
  };
  
  const startDate = formatDate(report.start_date);
  const endDate = formatDate(report.end_date);
  
  const handleCopyReport = () => {
    navigator.clipboard.writeText(report.report);
    setCopiedAlert(true);
    setTimeout(() => setCopiedAlert(false), 2000);
  };
  
  return (
    <Box>
      {/* Report header with event details */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="h5" component="h2">
            {report.event_name}
          </Typography>
          <Box>
            <Tooltip title="Copy report to clipboard">
              <IconButton onClick={handleCopyReport}>
                <ContentCopy />
              </IconButton>
            </Tooltip>
            <Tooltip title="Save as PDF">
              <IconButton>
                <SaveAlt />
              </IconButton>
            </Tooltip>
            <Tooltip title="Print report">
              <IconButton onClick={() => window.print()}>
                <Print />
              </IconButton>
            </Tooltip>
            <Tooltip title="Share report">
              <IconButton>
                <Share />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center', mb: 2 }}>
          <Chip 
            icon={<Public fontSize="small" />}
            label={`${startDate} to ${endDate}`} 
            size="small" 
            color="primary"
            variant="outlined"
          />
          <Chip 
            icon={<Info fontSize="small" />}
            label={`${report.sources?.length || 0} sources`} 
            size="small"
          />
          {copiedAlert && (
            <Chip 
              label="Report copied!" 
              color="success" 
              size="small" 
              sx={{ ml: 'auto' }}
            />
          )}
        </Box>
        
        <Divider />
        
        <Box sx={{ mt: 2, mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            This report was automatically generated based on available data. Information should be verified before making critical decisions.
          </Typography>
        </Box>
      </Paper>
      
      {/* Report content */}
      <Paper 
        sx={{ 
          p: 3, 
          mb: 3, 
          typography: 'body1',
          '& h1': { fontSize: '1.8rem', mt: 2, mb: 1 },
          '& h2': { fontSize: '1.5rem', mt: 3, mb: 2 },
          '& h3': { fontSize: '1.3rem', mt: 2, mb: 1 },
          '& ul, & ol': { pl: 2 },
          '& p': { mb: 2 },
          '& a': { color: 'primary.main' }
        }}
      >
        <ReactMarkdown>{report.report}</ReactMarkdown>
      </Paper>
      
      {/* Sources section */}
      {report.sources && report.sources.length > 0 && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Sources
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {report.sources.map((url, index) => (
              <Card key={index} variant="outlined" sx={{ mb: 1 }}>
                <CardContent sx={{ py: 1, '&:last-child': { pb: 1 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ maxWidth: '80%', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {index + 1}. {url}
                    </Typography>
                    <Button
                      startIcon={<Launch />}
                      size="small"
                      onClick={() => onSourceClick ? onSourceClick(url) : window.open(url, '_blank')}
                    >
                      Visit
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Paper>
      )}
    </Box>
  );
}