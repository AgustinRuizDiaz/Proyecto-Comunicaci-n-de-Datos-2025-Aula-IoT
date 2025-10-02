---
trigger: always_on
---

```markdown
# Reglas de Flujo de Trabajo

## Orden de Implementación
1. Modelo Django → Serializer → ViewSet → URL
2. Service (frontend) → Hook → Component → Page
3. Test unitario → Test integración → Test E2E

## Checklist Pre-Commit
- [ ] Tests pasan (pytest backend, npm test frontend)
- [ ] No console.log() en producción
- [ ] No datos hardcodeados
- [ ] Queries optimizadas (no N+1)
- [ ] Manejo de errores completo
- [ ] Loading states implementados
- [ ] Responsive verificado

## Comandos Útiles
```bash
# Backend
python manage.py makemigrations
python manage.py migrate
python manage.py runserver

# Frontend  
npm run dev
npm run build
npm run preview

# Testing
pytest backend/
npm test frontend/

# Linting
black backend/
prettier --write frontend/
Git Workflow
bash# Feature branch
git checkout -b feature/nombre-feature

# Commits semánticos
git commit -m "feat: agregar gestión de aulas"
git commit -m "fix: corregir validación de legajo"
git commit -m "docs: actualizar README"
git commit -m "test: agregar tests de permisos"
Performance Checks

Django Debug Toolbar activo en desarrollo
React DevTools Profiler para componentes lentos
Network tab para verificar tamaño de bundles
Lighthouse para auditoría PWA

