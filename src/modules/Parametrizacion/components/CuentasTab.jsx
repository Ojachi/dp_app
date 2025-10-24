import React, { useEffect, useState, useCallback } from 'react';
import { Input, Button, LoadingSpinner, Modal, useModal, useToast, Table } from '../../../components';
import { pagosService } from '../../../services/pagosService';

const CuentasTab = () => {
  const { toast } = useToast();
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ id: null, nombre: '', numero: '' });
  const modal = useModal();

  const load = useCallback(async () => {
    setLoading(true);
    try {
  const data = await pagosService.getCuentas();
      const rows = Array.isArray(data?.results) ? data.results : (Array.isArray(data) ? data : []);
  // Map to only show nombre y número
  setItems(rows.map(r => ({ id: r.id, nombre: r.nombre || r.banco || '', numero: r.numero || '' })));
    } catch (e) {
      toast.error('No fue posible cargar cuentas');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const openNew = () => {
    setForm({ id: null, nombre: '', numero: '' });
    modal.openModal();
  };

  const openEdit = (row) => {
    setForm({ id: row.id, nombre: row.nombre || '', numero: row.numero || '' });
    modal.openModal();
  };

  const save = async () => {
    try {
  const payload = { nombre: String(form.nombre).trim(), numero: String(form.numero).trim() };
      if (!form.id) await pagosService.createCuenta(payload);
      else await pagosService.updateCuenta(form.id, payload);
      toast.success('Guardado');
      modal.closeModal();
      load();
    } catch (e) {
      toast.error(e.message || 'No fue posible guardar');
    }
  };

  if (loading) return <LoadingSpinner message="Cargando cuentas..." />;

  const filtered = items.filter((it) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      String(it.nombre || '').toLowerCase().includes(q) ||
      String(it.numero || '').toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <div className="row g-2 mb-2">
        <div className="col-md-6">
          <Input label="Buscar" value={search} onChange={setSearch} placeholder="Buscar por nombre o número" />
        </div>
        <div className="col-md-6 d-flex justify-content-end align-items-end">
          <Button onClick={openNew}><i className="fas fa-plus me-2"/>Nueva Cuenta</Button>
        </div>
      </div>
      <Table
        columns={[
          { key: 'nombre', header: 'Nombre' },
          { key: 'numero', header: 'Número' },
          { key: 'actions', header: '', render: (row) => (
              <Button variant="secondary" size="sm" onClick={() => openEdit(row)}>
                <i className="fas fa-edit"/> Editar
              </Button>
            )
          },
        ]}
        data={filtered}
        emptyMessage="No hay cuentas registradas"
      />

      <Modal {...modal.modalProps}>
        <div className="modal-header">
          <h5 className="modal-title">{form.id ? 'Editar' : 'Nueva'} Cuenta</h5>
          <button type="button" className="btn-close" onClick={modal.closeModal}/>
        </div>
        <div className="modal-body">
          <div className="row g-2">
            <div className="col-md-6">
              <Input label="Nombre" value={form.nombre} onChange={(v) => setForm(prev => ({...prev, nombre: v}))}/>
            </div>
            <div className="col-md-6">
              <Input label="Número" value={form.numero} onChange={(v) => setForm(prev => ({...prev, numero: v}))}/>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <Button variant="secondary" onClick={modal.closeModal}>Cancelar</Button>
          <Button variant="primary" onClick={save}>Guardar</Button>
        </div>
      </Modal>
    </div>
  );
};

export default CuentasTab;
