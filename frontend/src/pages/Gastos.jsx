import TransactionsPage from '../components/TransactionsPage';
import { CATEGORIAS_GASTO } from '../utils/format';

export default function Gastos() {
  return (
    <TransactionsPage
      tipo="gasto"
      categorias={CATEGORIAS_GASTO}
      accentClass="expense"
    />
  );
}
