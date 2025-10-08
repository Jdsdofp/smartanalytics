// src/hooks/useCertificateData.ts

import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';



// Query para analytics de certificados
const GET_CERTIFICATE_ANALYTICS = gql`
  query GetCertificateAnalytics {
    certificateAnalytics {
      totalCertificates
      expiringNext90Days
      expiringPercentage
      complianceScore
      urgencyScore
      issuedLast90Days
      issuedPercentage
      criticalRiskCompanies
    }
  }
`;

// Query para certificados por status
const GET_CERTIFICATES_BY_STATUS = gql`
  query GetCertificatesByStatus {
    certificatesByStatus {
      status
      count
      percentage
      color
    }
  }
`;

// Query para top marcas
const GET_TOP_BRANDS = gql`
  query GetTopBrands($limit: Int) {
    topBrandsWithCertificates(limit: $limit) {
      brand
      count
    }
  }
`;

// Query para empresas por risco
const GET_COMPANIES_BY_RISK = gql`
  query GetCompaniesByRisk {
    companiesByRisk {
      riskLevel
      count
      color
    }
  }
`;

// Query para tendências
const GET_CERTIFICATE_TRENDS = gql`
  query GetCertificateTrends($topCompanies: Int) {
    certificateIssuanceTrends(topCompanies: $topCompanies) {
      companies
      trend7Days
      trend30Days
      trend90Days
    }
  }
`;

// Query para departamentos
const GET_CERTIFICATES_BY_DEPARTMENT = gql`
  query GetCertificatesByDepartment {
    certificatesByDepartment {
      department
      count
    }
  }
`;

// Hook customizado
export function useCertificateData() {
  const { data: analyticsData, loading: analyticsLoading } = useQuery(GET_CERTIFICATE_ANALYTICS, {
    pollInterval: 30000, // Atualiza a cada 30 segundos
  });

  const { data: statusData, loading: statusLoading } = useQuery(GET_CERTIFICATES_BY_STATUS);
  
  const { data: brandsData, loading: brandsLoading } = useQuery(GET_TOP_BRANDS, {
    variables: { limit: 10 },
  });
  
  const { data: riskData, loading: riskLoading } = useQuery(GET_COMPANIES_BY_RISK);
  
  const { data: trendsData, loading: trendsLoading } = useQuery(GET_CERTIFICATE_TRENDS, {
    variables: { topCompanies: 5 },
  });
  
  const { data: deptData, loading: deptLoading } = useQuery(GET_CERTIFICATES_BY_DEPARTMENT);

  return {
    analytics: analyticsData?.certificateAnalytics || {},
    statusData: statusData?.certificatesByStatus || [],
    brandsData: brandsData?.topBrandsWithCertificates || [],
    riskData: riskData?.companiesByRisk || [],
    trendsData: trendsData?.certificateIssuanceTrends || {},
    deptData: deptData?.certificatesByDepartment || [],
    loading: analyticsLoading || statusLoading || brandsLoading || riskLoading || trendsLoading || deptLoading,
  };
}
