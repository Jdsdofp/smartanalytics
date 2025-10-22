const company = JSON.parse(sessionStorage.getItem('companyData') || '{}')
console.log('Dados da empresa: ', company?.details.id)

export const companyId = company?.details.company_id;