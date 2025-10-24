/**
 * Servicios para entidades (clientes, vendedores, distribuidores)
 */
import apiClient from './api';

export const entidadesService = {
  // Servicios para clientes
  clientes: {
    async getAll() {
      try {
        const response = await apiClient.get('/clientes/clientes');
        return response.data;
      } catch (error) {
        throw new Error('Error al obtener clientes');
      }
    },

    async create(clienteData) {
      try {
        const response = await apiClient.post('/clientes/clientes/', clienteData);
        return response.data;
      } catch (error) {
        throw new Error(error.response?.data?.message || 'Error al crear cliente');
      }
    },

    async update(id, clienteData) {
      try {
        const response = await apiClient.put(`/clientes/clientes/${id}/`, clienteData);
        return response.data;
      } catch (error) {
        throw new Error('Error al actualizar cliente');
      }
    },

    async delete(id) {
      try {
        await apiClient.delete(`/clientes/clientes/${id}/`);
        return true;
      } catch (error) {
        throw new Error('Error al eliminar cliente');
      }
    }
  },

  // Servicios para poblaciones
  poblaciones: {
    async getAll() {
      try {
        const response = await apiClient.get('/clientes/poblaciones/');
        return response.data;
      } catch (error) {
        throw new Error('Error al obtener poblaciones');
      }
    },
    async create(data) {
      try {
        const response = await apiClient.post('/clientes/poblaciones/', data);
        return response.data;
      } catch (error) {
        throw new Error(error.response?.data?.message || 'Error al crear población');
      }
    },
    async update(id, data) {
      try {
        const response = await apiClient.patch(`/clientes/poblaciones/${id}/`, data);
        return response.data;
      } catch (error) {
        throw new Error(error.response?.data?.message || 'Error al actualizar población');
      }
    }
  },

  // Servicios para sucursales de cliente
  sucursales: {
    async getByCliente(clienteId) {
      try {
        const response = await apiClient.get('/clientes/clientes-sucursales/', {
          params: { cliente: clienteId }
        });
        return response.data;
      } catch (error) {
        throw new Error('Error al obtener sucursales del cliente');
      }
    },
    async create(data) {
      try {
        const response = await apiClient.post('/clientes/clientes-sucursales/', data);
        return response.data;
      } catch (error) {
        throw new Error(error.response?.data?.message || 'Error al crear sucursal');
      }
    }
  },

  // Servicios para vendedores
  vendedores: {
    async getAll() {
      try {
        const response = await apiClient.get('/vendedores/');
        return response.data;
      } catch (error) {
        throw new Error('Error al obtener vendedores');
      }
    }
  },

  // Servicios para distribuidores
  distribuidores: {
    async getAll() {
      try {
        const response = await apiClient.get('/distribuidores/');
        return response.data;
      } catch (error) {
        throw new Error('Error al obtener distribuidores');
      }
    }
  }
};