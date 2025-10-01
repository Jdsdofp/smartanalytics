// src/services/api.ts
import axios, { type AxiosInstance } from 'axios'

class ApiService {
  private api: AxiosInstance

  constructor() {
    this.api = axios.create({
      baseURL: 'https://smartmachine.smartxhub.cloud',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    // Interceptor para adicionar WebKey em todas as requisições
    this.api.interceptors.request.use((config) => {
      const webKey = sessionStorage.getItem('webKey')
      const user = sessionStorage.getItem('user')
      
      if (webKey && user) {
        const userData = JSON.parse(user)
        // Adiciona a WebKey no header ou como parâmetro, conforme sua API requer
        config.headers['X-Web-Key'] = webKey
        // Ou como query param: config.params = { ...config.params, webKey }
        
        // Adiciona companyId se necessário
        if (userData.companyId) {
          config.headers['X-Company-Id'] = userData.companyId
        }
      }
      
      return config
    })

    // Interceptor para tratar erros de autenticação
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expirado ou inválido - redireciona para login
          sessionStorage.clear()
          window.location.href = '/login'
        }
        return Promise.reject(error)
      }
    )
  }

  // Método para fazer login
  async login(username: string, password: string) {
    return this.api.post('/unified-auth', {
      login: username,
      password: password
    })
  }

  // Exemplos de métodos para outras operações
  async getMachines() {
    return this.api.get('/machines')
  }

  async getMachineById(id: number) {
    return this.api.get(`/machines/${id}`)
  }

  async getInventory() {
    return this.api.get('/inventory')
  }

  // Método genérico para GET
  async get(endpoint: string, params?: any) {
    return this.api.get(endpoint, { params })
  }

  // Método genérico para POST
  async post(endpoint: string, data: any) {
    return this.api.post(endpoint, data)
  }

  // Método genérico para PUT
  async put(endpoint: string, data: any) {
    return this.api.put(endpoint, data)
  }

  // Método genérico para DELETE
  async delete(endpoint: string) {
    return this.api.delete(endpoint)
  }
}

// Exporta uma instância única
export const api = new ApiService()

// Exemplo de uso em um componente:
/*
import { api } from '../services/api'

// Em uma função async
const machines = await api.getMachines()
console.log(machines.data)

// Ou com .then
api.getMachines()
  .then(response => console.log(response.data))
  .catch(error => console.error(error))
*/