
// ══════════════════════════════════════════════════════
// SECCIÓN PACIENTE — SeccionPaciente.jsx
// ══════════════════════════════════════════════════════
import { useHCU } from '../store/hcuStore';
import { Card, FieldGroup, Input, Select, SL } from './UIComponents';

export default function SeccionPaciente() {
  const { state, actions } = useHCU();
  const { paciente } = state;
  const set = (field) => (e) =>
    actions.setPaciente({ [field]: e.target.value });

  return (
    <Card
      icon="👤"
      title="A. Datos del Establecimiento y Paciente"
      badge={new Date()
        .toLocaleDateString('es-EC', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
        .toUpperCase()}
      colorClass="ch-teal"
    >
      <SL>Establecimiento</SL>
      <div className="g3" style={{ marginBottom: 12 }}>
        <FieldGroup label="Institución del Sistema">
          <Input
            value={state.institucion}
            onChange={(e) => actions.setAuditoria({})}
            placeholder="MSP / IESS / ISSFA"
          />
        </FieldGroup>
        <FieldGroup label="Establecimiento de Salud">
          <Input
            value={state.establecimiento}
            placeholder="Nombre del establecimiento"
          />
        </FieldGroup>
        <FieldGroup label="Unicódigo">
          <Input
            value={paciente.unicodigo || ''}
            onChange={set('unicodigo')}
            placeholder="UNICODIGO-MSP"
            mono
          />
        </FieldGroup>
      </div>

      <SL>Identificación del Paciente</SL>
      <div className="g4" style={{ marginBottom: 12 }}>
        <FieldGroup label="Apellidos y Nombres">
          <Input
            id="pac-nombre"
            value={paciente.nombres}
            onChange={set('nombres')}
            placeholder="Apellido Apellido, Nombre Nombre"
          />
        </FieldGroup>
        <FieldGroup label="N° Historia Clínica Única">
          <Input
            id="pac-cedula"
            value={paciente.hcl}
            onChange={set('hcl')}
            placeholder="0000000000"
            mono
          />
        </FieldGroup>
        <FieldGroup label="N° de Archivo">
          <Input
            value={paciente.archivo}
            onChange={set('archivo')}
            placeholder="ARC-0000"
            mono
          />
        </FieldGroup>
        <FieldGroup label="N° de Hoja">
          <Input
            id="pac-hoja"
            value={paciente.hoja}
            onChange={set('hoja')}
            mono
            style={{ fontWeight: 800 }}
          />
        </FieldGroup>
      </div>

      <div className="g5" style={{ marginBottom: 12 }}>
        <FieldGroup label="Primer Apellido">
          <Input value={paciente.apellido1} onChange={set('apellido1')} />
        </FieldGroup>
        <FieldGroup label="Segundo Apellido">
          <Input value={paciente.apellido2} onChange={set('apellido2')} />
        </FieldGroup>
        <FieldGroup label="Primer Nombre">
          <Input value={paciente.nombre1} onChange={set('nombre1')} />
        </FieldGroup>
        <FieldGroup label="Segundo Nombre">
          <Input value={paciente.nombre2} onChange={set('nombre2')} />
        </FieldGroup>
        <FieldGroup label="Sexo">
          <Select
            value={paciente.sexo}
            onChange={set('sexo')}
            options={['', 'H — Hombre', 'M — Mujer']}
          />
        </FieldGroup>
      </div>

      <div className="g5">
        <FieldGroup label="Edad">
          <Input
            id="pac-edad"
            value={paciente.edad}
            onChange={set('edad')}
            placeholder="45A 3M"
          />
        </FieldGroup>
        <FieldGroup label="Fecha de Evolución">
          <Input
            id="pac-fecha"
            type="date"
            value={paciente.fecha}
            onChange={set('fecha')}
          />
        </FieldGroup>
        <FieldGroup label="Servicio / Sala">
          <Input
            id="pac-sala"
            value={paciente.sala}
            onChange={set('sala')}
            placeholder="Cirugía · Sala 2"
          />
        </FieldGroup>
        <FieldGroup label="Cama">
          <Input
            id="pac-cama"
            value={paciente.cama}
            onChange={set('cama')}
            placeholder="204-B"
            mono
          />
        </FieldGroup>
        <FieldGroup label="Alergias ⚠️">
          <Input
            id="pac-alerg"
            value={paciente.alergias}
            onChange={set('alergias')}
            placeholder="NKDA o especifique"
            redText
          />
        </FieldGroup>
      </div>

      <div className="g3" style={{ marginTop: 12 }}>
        <FieldGroup label="Médico Tratante">
          <Input
            id="pac-medico"
            value={paciente.medico}
            onChange={set('medico')}
            placeholder="Dr. Apellido Nombre"
          />
        </FieldGroup>
        <FieldGroup label="Días de Hospitalización">
          <Input
            id="pac-dias"
            type="number"
            value={paciente.dias}
            onChange={set('dias')}
            placeholder="0"
            mono
          />
        </FieldGroup>
        <FieldGroup label="Condición de Edad">
          <Select
            value={paciente.condicion_edad}
            onChange={set('condicion_edad')}
            options={['', 'H — Horas', 'D — Días', 'M — Meses', 'A — Años']}
          />
        </FieldGroup>
      </div>
    </Card>
  );
}
