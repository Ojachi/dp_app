import React, { useState, useMemo } from "react";
import Table from "../../components/Table";
import Pagination from "../../components/Pagination";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import Select from "../../components/Select";
import Input from "../../components/Input";
import Radio from "../../components/Radio";
import Checkbox from "../../components/Checkbox";
import SearchBar from "../../components/SearchBar";
import FiltersSidebar from "../../components/FiltersSidebar";
import { CContainer, CCol, CRow } from "@coreui/react";

// Columnas de tabla
const TABLE_COLUMNS = [
  { key: "id", label: "ID" },
  { key: "responsable", label: "Responsable" },
  { key: "factura", label: "Factura" },
  { key: "valor", label: "Valor Pago" },
  { key: "fecha", label: "Fecha" },
];

// Datos ejemplo de pagos
const pagosEjemplo = [
  {
    id: 1,
    responsable: "Juan Pérez",
    factura: "FE 001-01-00001",
    valor: 150000,
    fecha: "2025-09-10",
  },
  {
    id: 2,
    responsable: "María López",
    factura: "R 002-01-00005",
    valor: 200000,
    fecha: "2025-09-15",
  },
];

// Datos ejemplo opciones selects
const responsables = [
  { value: "Juan Pérez", label: "Juan Pérez" },
  { value: "María López", label: "María López" },
];
const facturas = [
  { value: "FE 001-01-00001", label: "FE 001-01-00001" },
  { value: "R 002-01-00005", label: "R 002-01-00005" },
];
const formasPago = [
  { value: "efectivo", label: "Efectivo" },
  { value: "consignacion", label: "Consignación" },
];
const cuentasConsignacion = [
  { value: "banco1", label: "Bancolombia - 12345" },
  { value: "banco2", label: "Davivienda - 54321" },
];

// Configuración dinámica de filtros para usar en FiltersSidebar
const filterConfig = [
  {
    type: "select",
    id: "responsable",
    label: "Responsable",
    options: [{ label: "Todos", value: "" }, ...responsables],
  },
  {
    type: "input",
    id: "precioMin",
    label: "Precio mínimo",
    inputType: "number",
  },
  {
    type: "input",
    id: "precioMax",
    label: "Precio máximo",
    inputType: "number",
  },
  {
    type: "input",
    id: "fechaInicio",
    label: "Fecha inicio",
    inputType: "date",
  },
  {
    type: "input",
    id: "fechaFin",
    label: "Fecha fin",
    inputType: "date",
  },
];

const PagosView = ({ user = { rol: "vendedor" } }) => {
  // Estados
  const [modalAbierto, setModalAbierto] = useState(false);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [filters, setFilters] = useState({
    responsable: "",
    precioMin: "",
    precioMax: "",
    fechaInicio: "",
    fechaFin: "",
  });
  const [searchText, setSearchText] = useState("");
  const [formaPago, setFormaPago] = useState("efectivo");
  const [tieneNota, setTieneNota] = useState("no");
  const [responsable, setResponsable] = useState("");
  const [factura, setFactura] = useState("");
  const [firma, setFirma] = useState("");
  const [recibido, setRecibido] = useState(false);

  const esVendedor = user.rol === "vendedor";

  // Filtrar pagos basado en búsqueda y filtros
  const filteredPagos = useMemo(() => {
    return pagosEjemplo.filter(
      (p) =>
        (!filters.responsable ||
          p.responsable
            .toLowerCase()
            .includes(filters.responsable.toLowerCase())) &&
        (!filters.precioMin || p.valor >= Number(filters.precioMin)) &&
        (!filters.precioMax || p.valor <= Number(filters.precioMax)) &&
        (!filters.fechaInicio || p.fecha >= filters.fechaInicio) &&
        (!filters.fechaFin || p.fecha <= filters.fechaFin) &&
        (p.responsable.toLowerCase().includes(searchText.toLowerCase()) ||
          p.factura.toLowerCase().includes(searchText.toLowerCase()))
    );
  }, [filters, searchText]);

  // Maneja el envio del formulario de pago
  const handleAgregarPago = (e) => {
    e.preventDefault();
    // Aquí la lógica para guardar pago en backend
    setModalAbierto(false);
  };

  // Formulario para el modal
  const formularioPago = (
    <form onSubmit={handleAgregarPago}>
      {user.rol !== "vendedor" && (
        <Select
          id="responsable"
          label="Responsable"
          options={responsables}
          value={responsable}
          onChange={(e) => setResponsable(e.target.value)}
        />
      )}
      <Select
        id="factura"
        label="Factura"
        options={facturas}
        value={factura}
        onChange={(e) => setFactura(e.target.value)}
      />
      <Input
        id="valorPago"
        type="number"
        placeholder="Valor del pago"
        label="Valor del Pago"
      />
      <Radio
        name="nota"
        label="¿Tiene nota?"
        options={[
          { value: "si", label: "Sí" },
          { value: "no", label: "No" },
        ]}
        value={tieneNota}
        onChange={(e) => setTieneNota(e.target.value)}
      />
      {tieneNota === "si" && (
        <>
          <Input
            id="valorNota"
            placeholder="Valor de la nota"
            label="Valor Nota"
          />
          <Input
            id="motivoNota"
            placeholder="Motivo de la nota"
            label="Motivo Nota"
          />
        </>
      )}
      {esVendedor && (
        <>
          <Input id="descuento" placeholder="Descuento" label="Descuento" />
          <Input
            id="retencion"
            placeholder="Retención (FE)"
            label="Retención"
          />
          <Input id="ica" placeholder="ICA (FE)" label="ICA" />
        </>
      )}
      <Select
        id="formaPago"
        label="Forma de Pago"
        options={formasPago}
        value={formaPago}
        onChange={(e) => setFormaPago(e.target.value)}
      />
      {formaPago === "consignacion" && (
        <>
          <Select
            id="cuentaPago"
            label="Cuenta de Pago"
            options={cuentasConsignacion}
          />
          <Input id="soportePago" type="file" label="Soporte de Pago" />
        </>
      )}
      {formaPago === "efectivo" && (
        <Input
          id="firma"
          placeholder="Firma del responsable"
          label="Firma"
          value={firma}
          onChange={(e) => setFirma(e.target.value)}
        />
      )}
      {user.rol === "admin" && (
        <Checkbox
          id="recibido"
          label="¿Recibido?"
          checked={recibido}
          onChange={(e) => setRecibido(e.target.checked)}
        />
      )}
      <div className="d-flex justify-content-end mt-3">
        <Button
          color="secondary"
          onClick={() => setModalAbierto(false)}
          type="button"
        >
          Cancelar
        </Button>
        <Button color="primary" type="submit" className="ms-2">
          Guardar Pago
        </Button>
      </div>
    </form>
  );

  return (
    <div>
      <h1>Gestión De Pagos</h1>
      <CContainer fluid>
        <CRow className="align-items-center mb-3">
          <CCol xs={12} md={7}>
            <SearchBar value={searchText} onChange={setSearchText} />
          </CCol>
          <CCol xs={6} md={4} style={{ textAlign: "right" }}>
            <Button
              color="primary"
              
              onClick={() => setModalAbierto(true)}
            >
              Agregar Pago
            </Button>
          </CCol>
          <CCol xs={6} md={1} style={{ textAlign: "right" }}>
            <Button
              color="primary"
              
              onClick={() => setFiltersVisible(true)}
            >
              Filtros
            </Button>
          </CCol>
          
        </CRow>
      </CContainer>

      <Table columns={TABLE_COLUMNS} data={filteredPagos} bordered />
      <Pagination page={1} pageCount={1} onPageChange={() => {}} />
      <Modal
        visible={modalAbierto}
        onClose={() => setModalAbierto(false)}
        title="Agregar Pago"
      >
        {formularioPago}
      </Modal>
      <FiltersSidebar
        visible={filtersVisible}
        onClose={() => setFiltersVisible(false)}
        filters={filters}
        setFilters={setFilters}
        filterConfig={filterConfig}
        responsables={responsables}
        
      />
    </div>
  );
};

export default PagosView;
