import React, { useEffect, useState, useCallback } from 'react';
import { Input, Select, Button, LoadingSpinner, Modal, useModal, useToast, Table } from '../../../components';
import { entidadesService } from '../../../services/entidadesService';

const ClientesSucursalesTab = () => {
  const { toast } = useToast();
  const [clientes, setClientes] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [poblaciones, setPoblaciones] = useState([]);
  const [selectedCliente, setSelectedCliente] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ id: null, cliente: '', poblacion: '', codigo: '', condicion_pago: '' });
  const [nuevoClienteNombre, setNuevoClienteNombre] = useState('');
  const clienteModal = useModal();
  const modal = useModal();

  const asArray = (d) => (Array.isArray(d) ? d : (d && Array.isArray(d.results) ? d.results : []));

  const loadClientes = useCallback(async () => {
    try {
      const data = await entidadesService.clientes.getAll();
      setClientes(asArray(data));
    } catch (e) {
      toast.error('No fue posible cargar clientes');
    }
  }, [toast]);

  const loadPoblaciones = useCallback(async () => {
    try {
      const data = await entidadesService.poblaciones.getAll();
      setPoblaciones(asArray(data));
    } catch (e) {
      toast.error('No fue posible cargar poblaciones');
    }
  }, [toast]);

  const loadSucursales = useCallback(async (clienteId) => {
    if (!clienteId) { setSucursales([]); return; }
    setLoading(true);
    try {
      const data = await entidadesService.sucursales.getByCliente(clienteId);
      setSucursales(asArray(data));
    } catch (e) {
      toast.error('No fue posible cargar sucursales');
    } finally { setLoading(false); }
  }, [toast]);

  useEffect(() => { loadClientes(); loadPoblaciones(); }, [loadClientes, loadPoblaciones]);
  useEffect(() => { loadSucursales(selectedCliente); }, [selectedCliente, loadSucursales]);

  const openNew = () => {
    setForm({ id: null, cliente: selectedCliente || '', poblacion: '', codigo: '', condicion_pago: '' });
    modal.openModal();
  };

  const openEdit = (row) => {
    setForm({ id: row.id, cliente: row.cliente, poblacion: row.poblacion, codigo: row.codigo, condicion_pago: row.condicion_pago });
    modal.openModal();
  };

  const save = async () => {
    try {
      const clienteId = form.cliente;
      const payload = { cliente: Number(clienteId), poblacion: Number(form.poblacion), codigo: String(form.codigo).trim(), condicion_pago: form.condicion_pago || undefined };
      if (!clienteId || !form.poblacion || !payload.codigo) {
        toast.warning('Cliente, Población y Código son obligatorios');
        return;
      }
      if (!form.id) await entidadesService.sucursales.create(payload);
      else {
        // Not implementing update API here to keep risk low; could add when needed.
        toast.info('Edición de sucursal no implementada aún. Cree una nueva si necesita cambiar.');
      }
      toast.success('Guardado');
      modal.closeModal();
      loadSucursales(selectedCliente);
    } catch (e) {
      toast.error(e.message || 'No fue posible guardar');
    }
  };

  const saveCliente = async () => {
    try {
      const nombre = (nuevoClienteNombre || '').trim();
      if (!nombre) { toast.warning('Ingrese un nombre de cliente'); return; }
      const creado = await entidadesService.clientes.create({ nombre });
      toast.success('Cliente creado');
      setNuevoClienteNombre('');
      clienteModal.closeModal();
      await loadClientes();
      setSelectedCliente(String(creado.id));
    } catch (e) {
      toast.error(e.message || 'No fue posible crear el cliente');
    }
  };

  return (
    <div>
      <div className="row g-2 mb-2">
        <div className="col-md-6">
          <Select
            label="Cliente"
            value={selectedCliente}
            onChange={setSelectedCliente}
            placeholder={null}
            options={[{ value: '', label: 'Seleccionar...' }, ...clientes.map(c => ({ value: String(c.id), label: c.nombre }))]}
          />
        </div>
        <div className="col-md-6 d-flex align-items-end justify-content-end gap-2">
          <Button variant="secondary" onClick={clienteModal.openModal}><i className="fas fa-user-plus me-2"/>Agregar Cliente</Button>
          <Button onClick={openNew} disabled={!selectedCliente}><i className="fas fa-plus me-2"/>Nueva Sucursal</Button>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Cargando sucursales..." />
      ) : (
        <Table
          columns={[
            { key: 'codigo', header: 'Código' },
            { key: 'poblacion_nombre', header: 'Población' },
            { key: 'condicion_pago', header: 'Condición de pago' },
            { key: 'activo', header: 'Activa', render: (r) => (r.activo ? 'Sí' : 'No') },
            { key: 'actions', header: '', render: (row) => (
                <Button variant="secondary" size="sm" onClick={() => openEdit(row)}>
                  <i className="fas fa-edit"/> Editar
                </Button>
              )
            },
          ]}
          data={sucursales}
          emptyMessage={selectedCliente ? 'El cliente no tiene sucursales registradas' : 'Seleccione un cliente'}
        />
      )}

      <Modal {...modal.modalProps}>
        <div className="modal-header">
          <h5 className="modal-title">{form.id ? 'Editar' : 'Nueva'} Sucursal</h5>
          <button type="button" className="btn-close" onClick={modal.closeModal}/>
        </div>
        <div className="modal-body">
          <div className="row g-2">
            <div className="col-md-4">
              <Select
                label="Cliente"
                value={form.cliente}
                placeholder={null}
                onChange={(v) => setForm(prev => ({...prev, cliente: v}))}
                options={[{ value: '', label: 'Seleccionar...' }, ...clientes.map(c => ({ value: String(c.id), label: c.nombre }))]}
              />
            </div>
            <div className="col-md-4">
              <Select
                label="Población"
                value={form.poblacion}
                placeholder={null}
                onChange={(v) => setForm(prev => ({...prev, poblacion: v}))}
                options={[{ value: '', label: 'Seleccionar...' }, ...poblaciones.map(p => ({ value: String(p.id), label: p.nombre }))]}
              />
            </div>
            <div className="col-md-4">
              <Input label="Código" value={form.codigo} onChange={(v) => setForm(prev => ({...prev, codigo: v}))}/>
            </div>
            <div className="col-md-4">
              <Select
                label="Condición de pago"
                value={form.condicion_pago}
                placeholder={null}
                onChange={(v) => setForm(prev => ({...prev, condicion_pago: v}))}
                options={[
                  { value: '', label: 'Seleccionar...' },
                  { value: 'contado', label: 'Contado' },
                  { value: '15d', label: '15 días' },
                  { value: '10d', label: '10 días' },
                  { value: '5d', label: '5 días' },
                ]}
              />
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <Button variant="secondary" onClick={modal.closeModal}>Cancelar</Button>
          <Button variant="primary" onClick={save}>Guardar</Button>
        </div>
      </Modal>

      {/* Modal agregar cliente */}
      <Modal {...clienteModal.modalProps}>
        <div className="modal-header">
          <h5 className="modal-title">Agregar Cliente</h5>
          <button type="button" className="btn-close" onClick={clienteModal.closeModal}/>
        </div>
        <div className="modal-body">
          <Input label="Nombre del cliente" value={nuevoClienteNombre} onChange={setNuevoClienteNombre} />
        </div>
        <div className="modal-footer">
          <Button variant="secondary" onClick={clienteModal.closeModal}>Cancelar</Button>
          <Button variant="primary" onClick={saveCliente}>Guardar</Button>
        </div>
      </Modal>
    </div>
  );
};

export default ClientesSucursalesTab;
