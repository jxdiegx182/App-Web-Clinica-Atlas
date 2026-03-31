import { useHCU } from '../store/hcuStore';
import { Card, FieldGroup } from './UIComponents';               
export default function SeccionExamenes() {
  const { state, actions } = useHCU();
  const { examenes } = state;
  return (
    <Card icon="🔬" title="Exámenes Complementarios" colorClass="ch-teal">
      <div className="g2">
        <FieldGroup label="Exámenes Solicitados">
          <textarea
            className="fta"
            id="examenes-sol"
            value={examenes.solicitados}
            onChange={(e) =>
              actions.setExamenes({ solicitados: e.target.value })
            }
            placeholder={
              'Lab: BH, QS, TP, TTP\nImagen: Rx Tórax, ECO abdominal\nOtros: ECG, Cultivos...'
            }
          />
        </FieldGroup>
        <FieldGroup label="Resultados / Interpretación">
          <textarea
            className="fta"
            id="examenes-res"
            value={examenes.resultados}
            onChange={(e) =>
              actions.setExamenes({ resultados: e.target.value })
            }
            placeholder="Resultados relevantes y su interpretación clínica..."
          />
        </FieldGroup>
      </div>
    </Card>
  );
}
