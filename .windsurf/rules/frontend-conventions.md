---
trigger: always_on
---

```markdown
# Convenciones Frontend (React)

## Estructura de Componentes
```typescript
// Componente estándar con TypeScript
interface Props {
  aula: Aula;
  onUpdate: (id: number) => void;
}

export const AulaCard: React.FC<Props> = ({ aula, onUpdate }) => {
  // Hooks primero
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  
  // Handlers después
  const handleClick = useCallback(() => {
    // lógica
  }, [dependencies]);
  
  // Effects al final
  useEffect(() => {
    // efecto
  }, [dependencies]);
  
  return (
    // JSX
  );
};
Custom Hooks Obligatorios
typescript// useAuth - gestión de autenticación
// useWebSocket - conexión tiempo real
// useApi - llamadas HTTP con loading/error states
// useDebounce - para búsquedas
// useLocalStorage - persistencia local
Gestión de Estado

Context API para estado global (auth, theme)
useState para estado local del componente
useReducer para lógica compleja de estado
NO usar Redux a menos que sea absolutamente necesario

Estilos con Tailwind
jsx// Clases organizadas por categoría
className="
  // Layout
  flex flex-col gap-4
  // Spacing
  p-4 mx-auto
  // Sizing
  w-full max-w-4xl
  // Colors
  bg-white text-gray-900
  // Borders
  rounded-lg border border-gray-200
  // Effects
  shadow-sm hover:shadow-md
  // Transitions
  transition-shadow duration-200
  // Responsive
  md:flex-row lg:gap-6
"
Manejo de Errores

Try-catch en todas las llamadas async
Error boundaries para errores de renderizado
Toast notifications para feedback usuario
Loading skeletons, no spinners

Optimizaciones Performance

React.memo para componentes pesados
useMemo y useCallback apropiadamente
Lazy loading de rutas
Virtual scrolling para listas largas (>100 items)