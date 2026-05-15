import TransactionsPage from '../components/TransactionsPage';
import { CATEGORIAS_INGRESO } from '../utils/format';

export default function Ingresos() {
  return (
    <TransactionsPage
      tipo="ingreso"
      categorias={CATEGORIAS_INGRESO}
      accentClass="income"
    />
  );
}
