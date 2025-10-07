// src/graphql/queries.ts
import { gql } from '@apollo/client';

export const GET_CERTIFICATE_DASHBOARD = gql`
  query GetCertificateDashboard {
    certificateMetrics {
      total
      expired
      approved
      expiring_90_days
      expiring_soon
      high_risk
      medium_risk
      low_risk
      total_financial_risk
      avg_renewal_probability
    }
    certificatesByDepartment {
      name
      count
      expired
    }
    certificatesByType {
      name
      count
      expired
    }
    certificateExpirationByMonth {
      month
      expired
      expiring_0_30
      expiring_31_90
      valid
    }
    certificateExpirationRanges {
      under_minus_200
      minus_200_to_minus_100
      minus_100_to_minus_50
      minus_50_to_0
      zero_to_50
      range_50_to_100
      over_100
    }
  }
`;

export const GET_PREDICTIVE_CERTIFICATES = gql`
  query GetPredictiveCertificates {
    predictiveCertificates {
      id
      certificate_status_name
      certificate_type
      combined_risk_score
      department_name
      expiration_date
      days_until_expiration
      financial_risk_value
      renewal_probability_score
      is_expiring_90_days
      is_expiring_soon
    }
  }
`;