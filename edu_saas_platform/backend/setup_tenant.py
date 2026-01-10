# setup_tenant.py
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from users.models import Client, Domain, User

def setup_tenant():
    print("=== Checking existing data ===")
    
    # Check if tenant already exists
    if Client.objects.filter(schema_name='public').exists():
        tenant = Client.objects.get(schema_name='public')
        print("✓ Tenant already exists")
    else:
        # Create tenant
        tenant = Client(schema_name='public', name='Public LMS System')
        tenant.save()
        print("✓ Tenant created")

    # Check if domain already exists
    if Domain.objects.filter(domain='localhost').exists():
        domain = Domain.objects.get(domain='localhost')
        print("✓ Domain already exists")
    else:
        # Create domain
        domain = Domain(domain='localhost', tenant=tenant, is_primary=True)
        domain.save()
        print("✓ Domain created")

    # Check if superuser already exists
    if User.objects.filter(username='admin').exists():
        print("✓ Superuser already exists")
    else:
        # Create superuser
        user = User.objects.create_superuser(
            username='admin',
            email='admin@example.com', 
            password='admin123',
            role='admin'
        )
        print("✓ Superuser created")
        print("Username: admin")
        print("Password: admin123")

    print("\n=== Setup Summary ===")
    print(f"Tenant: {tenant.name}")
    print(f"Domain: {domain.domain}")
    print(f"Superuser: admin")
    print("====================")

if __name__ == '__main__':
    setup_tenant()