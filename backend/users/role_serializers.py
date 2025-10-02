from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from .models import User
import re


class UserAdminSerializer(serializers.ModelSerializer):
    """
    Serializer completo para administradores - muestra todos los campos
    """
    class Meta:
        model = User
        fields = ['id', 'legajo', 'rol', 'is_active', 'is_staff', 'date_joined']
        read_only_fields = ['id', 'date_joined']


class UserOperatorSerializer(serializers.ModelSerializer):
    """
    Serializer limitado para operarios - oculta campos sensibles como is_staff
    """
    class Meta:
        model = User
        fields = ['id', 'legajo', 'rol', 'is_active', 'date_joined']
        read_only_fields = ['id', 'legajo', 'rol', 'is_active', 'date_joined']


class UserCreateSerializer(serializers.ModelSerializer):
    """
    Serializer para creación de usuarios (solo admins)
    """
    password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'},
        help_text='Contraseña del usuario (mínimo 8 caracteres)'
    )
    confirm_password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'},
        help_text='Confirmar contraseña'
    )

    class Meta:
        model = User
        fields = ['legajo', 'password', 'confirm_password', 'rol', 'is_active', 'is_staff']

    def validate_legajo(self, value):
        """
        Validar formato del legajo: solo números y letras, mínimo 3 caracteres
        """
        if not re.match(r'^[a-zA-Z0-9]{3,20}$', value):
            raise serializers.ValidationError(
                "El legajo debe contener solo letras y números, entre 3 y 20 caracteres."
            )
        return value

    def validate_rol(self, value):
        """
        Validar que el rol sea válido
        """
        valid_roles = ['Admin', 'Operario']
        if value not in valid_roles:
            raise serializers.ValidationError(f"Rol debe ser uno de: {', '.join(valid_roles)}")
        return value

    def validate(self, attrs):
        """
        Validar que las contraseñas coincidan
        """
        if attrs.get('password') != attrs.get('confirm_password'):
            raise serializers.ValidationError({
                "confirm_password": "Las contraseñas no coinciden."
            })

        # Validar contraseña usando Django's validators
        password = attrs.get('password')
        if password:
            try:
                validate_password(password)
            except ValidationError as e:
                raise serializers.ValidationError({
                    "password": list(e.messages)
                })

        return attrs

    def create(self, validated_data):
        """
        Crear usuario removiendo confirm_password y usando contraseña validada
        """
        validated_data.pop('confirm_password')
        password = validated_data.pop('password')
        user = User.objects.create_user(password=password, **validated_data)
        return user


class UserUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer para actualización de usuarios (solo admins)
    """
    password = serializers.CharField(
        write_only=True,
        required=False,
        style={'input_type': 'password'},
        help_text='Nueva contraseña (opcional)'
    )
    confirm_password = serializers.CharField(
        write_only=True,
        required=False,
        style={'input_type': 'password'},
        help_text='Confirmar nueva contraseña'
    )

    class Meta:
        model = User
        fields = ['rol', 'is_active', 'is_staff', 'password', 'confirm_password']

    def validate_legajo(self, value):
        """
        Nota: El legajo no se puede cambiar después de la creación
        """
        raise serializers.ValidationError("El legajo no se puede modificar después de la creación.")

    def validate_rol(self, value):
        """
        Validar que el rol sea válido
        """
        valid_roles = ['Admin', 'Operario']
        if value not in valid_roles:
            raise serializers.ValidationError(f"Rol debe ser uno de: {', '.join(valid_roles)}")
        return value

    def validate(self, attrs):
        """
        Validar contraseñas si se están cambiando
        """
        password = attrs.get('password')
        confirm_password = attrs.get('confirm_password')

        if password or confirm_password:
            if not password:
                raise serializers.ValidationError({
                    "password": "Se requiere contraseña para cambiarla."
                })
            if not confirm_password:
                raise serializers.ValidationError({
                    "confirm_password": "Se requiere confirmación de contraseña."
                })
            if password != confirm_password:
                raise serializers.ValidationError({
                    "confirm_password": "Las contraseñas no coinciden."
                })

            # Validar contraseña usando Django's validators
            try:
                validate_password(password)
            except ValidationError as e:
                raise serializers.ValidationError({
                    "password": list(e.messages)
                })

        return attrs

    def update(self, instance, validated_data):
        """
        Actualizar usuario manejando cambio de contraseña
        """
        # Remover campos de contraseña si están presentes
        validated_data.pop('password', None)
        validated_data.pop('confirm_password', None)

        # Cambiar contraseña si se proporcionó
        password = self.initial_data.get('password')
        if password:
            instance.set_password(password)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance


def get_user_serializer(user, context=None):
    """
    Retorna el serializer apropiado basado en el rol del usuario que hace la request
    """
    request = context.get('request') if context else None
    if request and hasattr(request, 'user') and request.user.rol == 'Admin':
        return UserAdminSerializer
    return UserOperatorSerializer
