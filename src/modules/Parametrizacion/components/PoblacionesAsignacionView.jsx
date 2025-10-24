/**
 * Vista para asignar Vendedores y Distribuidores a Poblaciones
 */
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { entidadesService } from '../../../services/entidadesService';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../components/Toast';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { Select } from '../../../components/Select';
import { Input } from '../../../components/Input';
import { Button } from '../../../components/Button';

const asArray = (data) => (Array.isArray(data) ? data : (data && Array.isArray(data.results) ? data.results : []));

const PoblacionesAsignacionView = () => {
  const { isGerente } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [savingRow, setSavingRow] = useState(null);
  const [poblaciones, setPoblaciones] = useState([]);
  const [vendedores, setVendedores] = useState([]);
  const [distribuidores, setDistribuidores] = useState([]);
  const [search, setSearch] = useState('');
  const [creating, setCreating] = useState(false);
  const [nuevaPoblacion, setNuevaPoblacion] = useState({ nombre: '', descripcion: '' });

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [pobs, vends, dists] = await Promise.all([
        entidadesService.poblaciones.getAll(),
        entidadesService.vendedores.getAll(),
        entidadesService.distribuidores.getAll(),
      ]);
      setPoblaciones(asArray(pobs));
      setVendedores(asArray(vends));
      setDistribuidores(asArray(dists));
    } catch (e) {
      console.error('Error cargando datos de asignación:', e);
      toast.error('No fue posible cargar datos de poblaciones');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const vendedoresOptions = useMemo(() => (
    [{ value: '', label: 'Sin vendedor' }].concat(
      vendedores.map(v => ({
        // Poblacion.vendedor espera el ID de usuario, no el ID del modelo Vendedor
        value: v.usuario ? String(v.usuario) : '',
        label: v.usuario_nombre || v.nombre || 'Vendedor'
      }))
    )
  ), [vendedores]);

  const distribuidoresOptions = useMemo(() => (
    [{ value: '', label: 'Sin distribuidor' }].concat(
      distribuidores.map(d => ({
        // Poblacion.distribuidor espera el ID de usuario
        value: d.usuario ? String(d.usuario) : '',
        label: d.usuario_nombre || d.nombre || 'Distribuidor'
      }))
    )
  ), [distribuidores]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return poblaciones;
    return poblaciones.filter(p =>
      String(p.nombre || '').toLowerCase().includes(q) ||
      String(p.vendedor_nombre || p.vendedor?.usuario?.full_name || '').toLowerCase().includes(q) ||
      String(p.distribuidor_nombre || p.distribuidor?.usuario?.full_name || '').toLowerCase().includes(q)
    );
  }, [poblaciones, search]);

  const handleAssign = async (poblacion, field, value) => {
    if (!isGerente()) {
      toast.warning('Solo un Gerente puede asignar poblaciones');
      return;
    }
    setSavingRow(poblacion.id);
    try {
      const payload = {};
      // El serializer de Poblacion acepta campos 'vendedor' y 'distribuidor' (IDs de usuario)
      if (field === 'vendedor') payload.vendedor = value || null;
      if (field === 'distribuidor') payload.distribuidor = value || null;
      const updated = await entidadesService.poblaciones.update(poblacion.id, payload);
      // Actualizar en memoria
      setPoblaciones(prev => prev.map(p => p.id === poblacion.id ? { ...p, ...updated } : p));
      toast.success('Asignación guardada');
    } catch (e) {
      console.error('Error asignando población:', e);
      toast.error('No fue posible guardar la asignación');
    } finally {
      setSavingRow(null);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Cargando poblaciones..." />;
  }

  return (
    <div className="container-fluid py-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h3 className="mb-1"><i className="fas fa-map-marker-alt me-2 text-primary"></i>Asignación de Poblaciones</h3>
          <p className="text-muted mb-0">Asigna Vendedores y Distribuidores por población. Un vendedor o distribuidor puede cubrir múltiples poblaciones.</p>
        </div>
        {isGerente() && (
          <div className="d-flex align-items-end" style={{minWidth: '360px'}}>
            {/* Quick create */}
            <div className="card w-100">
              <div className="card-body py-2">
                <div className="row g-2 align-items-end">
                  <div className="col-md-5">
                    <Input
                      label="Nueva Población *"
                      type="text"
                      value={nuevaPoblacion.nombre}
                      onChange={(val) => setNuevaPoblacion(prev => ({ ...prev, nombre: val }))}
                      placeholder="Nombre"
                    />
                  </div>
                  <div className="col-md-5">
                    <Input
                      label="Descripción"
                      type="text"
                      value={nuevaPoblacion.descripcion}
                      onChange={(val) => setNuevaPoblacion(prev => ({ ...prev, descripcion: val }))}
                      placeholder="Opcional"
                    />
                  </div>
                  <div className="col-md-2 d-grid">
                    <Button
                      variant="primary"
                      loading={creating}
                      disabled={creating || !nuevaPoblacion.nombre.trim()}
                      onClick={async () => {
                        if (!nuevaPoblacion.nombre.trim()) return;
                        setCreating(true);
                        try {
                          const created = await entidadesService.poblaciones.create({
                            nombre: nuevaPoblacion.nombre.trim(),
                            descripcion: nuevaPoblacion.descripcion?.trim() || ''
                          });
                          setPoblaciones(prev => [created, ...prev]);
                          setNuevaPoblacion({ nombre: '', descripcion: '' });
                          toast.success('Población creada');
                        } catch (e) {
                          console.error('Error creando población:', e);
                          toast.error('No fue posible crear la población');
                        } finally {
                          setCreating(false);
                        }
                      }}
                    >
                      Crear
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="row g-2 mb-3">
        <div className="col-md-6">
          <Input
            label="Buscar"
            type="text"
            value={search}
            onChange={setSearch}
            placeholder="Buscar por población, vendedor o distribuidor"
          />
        </div>
      </div>

      <div className="card">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="bg-light">
                <tr>
                  <th style={{width: '35%'}}>Población</th>
                  <th style={{width: '32%'}}>Vendedor asignado</th>
                  <th style={{width: '32%'}}>Distribuidor asignado</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id}>
                    <td className="align-middle">
                      <div className="fw-medium">{p.nombre}</div>
                      <small className="text-muted">ID: {p.id}</small>
                    </td>
                    <td>
            <Select
              value={p.vendedor ? String(p.vendedor) : ''}
                        options={vendedoresOptions}
                        onChange={(val) => handleAssign(p, 'vendedor', val)}
                        placeholder={null}
                        disabled={savingRow === p.id}
                      />
                    </td>
                    <td>
            <Select
              value={p.distribuidor ? String(p.distribuidor) : ''}
                        options={distribuidoresOptions}
                        onChange={(val) => handleAssign(p, 'distribuidor', val)}
                        placeholder={null}
                        disabled={savingRow === p.id}
                      />
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan="3" className="text-center text-muted py-4">
                      No hay resultados para la búsqueda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PoblacionesAsignacionView;
