import React from 'react';
import { Card, CardContent, Grid, Typography } from '@mui/material';
import { summaryCardsData } from '../../../../data/dashboardAdminData'; // Impor data

const RingkasanOperasional: React.FC = () => {
  return (
    <Grid container spacing={3}>
      {summaryCardsData.map((item) => (
        <Grid item xs={12} sm={6} md={3} key={item.id}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                {item.title}
              </Typography>
              <Typography variant="h4" component="div">
                {item.value}
              </Typography>
              <Typography
                sx={{ fontSize: 14 }}
                color={item.change >= 0 ? 'success.main' : 'error.main'}
              >
                {item.change >= 0 ? '+' : ''}
                {item.change} {item.period}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default RingkasanOperasional;
