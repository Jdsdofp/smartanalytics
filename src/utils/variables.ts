// //utils/variables
// const company = JSON.parse(sessionStorage.getItem('companyData') || '{}')
// // console.log('Dados da empresa: ', company?.details?.id)

// export const companyId = company?.details?.company_id;


// src/utils/variables.ts
import { useState, useEffect } from 'react';

export const useCompanyId = () => {
  const [companyId, setCompanyId] = useState<string | null>(null);

  useEffect(() => {
    const getCompanyData = () => {
      try {
        const company = JSON.parse(sessionStorage.getItem('companyData') || '{}');
        return company?.details?.company_id || null;
      } catch (error) {
        console.error('Error parsing company data:', error);
        return null;
      }
    };

    // Verificar imediatamente
    const companyId = getCompanyData();
    if (companyId) {
      setCompanyId(companyId);
    }

    // Configurar listener para mudanças no sessionStorage
    const handleStorageChange = () => {
      const newCompanyId = getCompanyData();
      setCompanyId(newCompanyId);
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Também verificar periodicamente (fallback)
    const interval = setInterval(() => {
      const newCompanyId = getCompanyData();
      if (newCompanyId && newCompanyId !== companyId) {
        setCompanyId(newCompanyId);
      }
    }, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  return companyId;
};

// Para compatibilidade com código existente
export let companyId: string | null = null;
export const setCompanyId = (id: string | null) => {
  companyId = id;
};