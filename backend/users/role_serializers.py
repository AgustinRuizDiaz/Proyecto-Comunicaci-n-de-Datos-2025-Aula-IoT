from rest_framework import serializers
from .models import User


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
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})

    class Meta:
        model = User
        fields = ['legajo', 'password', 'rol', 'is_active', 'is_staff']

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User.objects.create_user(password=password, **validated_data)
        return user


class UserUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer para actualización de usuarios (solo admins)
    """
    password = serializers.CharField(write_only=True, required=False, style={'input_type': 'password'})

    class Meta:
        model = User
        fields = ['rol', 'is_active', 'is_staff', 'password']

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
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
