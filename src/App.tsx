/**
 * Componente raíz de la aplicación.
 *
 * Su trabajo principal es declarar los \"límites\" globales:
 * en este caso, envolver todo con el provider de calculadora.
 */

import { CalculatorProvider } from './hooks/useCalculatorContext';
import { HomePage } from './pages/HomePage';

function App() {
  return (
    // El provider comparte estado/acciones con toda la UI calculadora.
    <CalculatorProvider>
      <HomePage />
    </CalculatorProvider>
  );
}

export default App;
