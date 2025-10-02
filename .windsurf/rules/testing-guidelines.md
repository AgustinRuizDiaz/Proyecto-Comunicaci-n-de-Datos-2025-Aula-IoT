---
trigger: always_on
---

```markdown
# Guías de Testing

## Tests Obligatorios Backend
```python
# Test de modelos
def test_user_creation():
    user = User.objects.create_user(legajo='123456')
    assert user.legajo == '123456'

# Test de permisos
def test_admin_can_create_aula():
    self.client.force_authenticate(user=admin_user)
    response = self.client.post('/api/aulas/', data)
    assert response.status_code == 201

# Test de validaciones
def test_duplicate_legajo_fails():
    User.objects.create_user(legajo='123456')
    with pytest.raises(IntegrityError):
        User.objects.create_user(legajo='123456')
Tests Frontend Críticos
typescript// Auth flow
test('user can login', async () => {
  render(<LoginPage />);
  // ...
});

// Permisos UI
test('admin sees delete button', () => {
  render(<AulaCard user={adminUser} />);
  expect(screen.getByText('Eliminar')).toBeInTheDocument();
});

// WebSocket updates
test('sensor state updates in real time', () => {
  // ...
});
Coverage Mínimo

Backend: 80% coverage
Frontend: 70% coverage
Crítico: 100% coverage en auth y permisos