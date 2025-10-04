// src/pages/certificates/index.tsx

import CertificateDashboard from "../../../components/Certificates";
import Layout from "../../../components/layout/Layout";


export default function Certificateds() {

    const sampleData = [
  {
    id: 272,
    company_name: "GRUPO PULSA",
    certificate_type: "CALIBRAÇÃO",
    certificate_status_name: "APPROVED",
    item_name: "TERMÔMETRO INFRAVERMELHO",
    issue_date: "2025-02-16 14:52:00",
    expiration_date: "2026-02-16 11:53:00",
    days_until_expiration: 137,
    validity_status: "VALID",
    combined_risk_score: 63.3,
    renewal_urgency_level: "LOW",
    asset_criticality: "STANDARD",
    department_name: "HEMOCENTRO FUJISAN FORTALEZA/CE",
    cost_center_name: "FUJISAN CENTRO DE HEMOTERAPIA E HEMATOLOGIA DO CEARÁ/CE",
    is_expiring_soon: 0,
    is_expiring_90_days: 0,
    is_expired: 0
  }]


  return (
    <Layout>
      <CertificateDashboard  data={sampleData} />
    </Layout>
  )
}