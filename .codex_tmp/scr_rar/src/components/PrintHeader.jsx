// PrintHeader.jsx — MANFHER SYSTEMS · Atlas HIS
// Solo visible en @media print
export default function PrintHeader({ paciente = {}, hoja = '1', establecimiento = 'Clínicas Atlas' }) {
  const nombre = [paciente.apellido1, paciente.apellido2, paciente.nombre1, paciente.nombre2]
    .filter(Boolean).join(' ') || paciente.nombres || '—';

  return (
    <div style={{ display: 'none' }} className="print-only">
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.75rem', marginBottom: 8 }}>
        <tbody>
          <tr>
            <td style={{ border: '1px solid #000', padding: '4px 8px', width: '40%' }}>
              <strong>MSP — MINISTERIO DE SALUD PÚBLICA</strong><br />
              {establecimiento}<br />
              <em>Form. 005 — Evolución y Prescripciones Médicas</em>
            </td>
            <td style={{ border: '1px solid #000', padding: '4px 8px' }}>
              <strong>Paciente:</strong> {nombre}<br />
              <strong>N° HCU:</strong> {paciente.hcl || '—'} &nbsp;&nbsp;
              <strong>Sala:</strong> {paciente.sala || '—'} &nbsp;&nbsp;
              <strong>Cama:</strong> {paciente.cama || '—'}
            </td>
            <td style={{ border: '1px solid #000', padding: '4px 8px', width: '15%', textAlign: 'center' }}>
              <strong>Hoja</strong><br />
              <span style={{ fontSize: '1.2rem', fontWeight: 700 }}>{hoja}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
