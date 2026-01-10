from django.core.management.base import BaseCommand
from django_tenants.utils import get_tenant_model, get_tenant_domain_model

class Command(BaseCommand):
    help = 'Setup public tenant and domains for development'
    
    def handle(self, *args, **options):
        Client = get_tenant_model()
        Domain = get_tenant_domain_model()
        
        # Create public tenant
        tenant, created = Client.objects.get_or_create(
            schema_name='public',
            defaults={
                'name': 'Public Tenant',
                'paid_until': '2025-12-31',
                'on_trial': False
            }
        )
        
        if created:
            self.stdout.write(
                self.style.SUCCESS('✅ Public tenant created successfully!')
            )
        else:
            self.stdout.write('ℹ️ Public tenant already exists')
        
        # Create domains
        domains = ['127.0.0.1', 'localhost']
        for domain_name in domains:
            domain, dom_created = Domain.objects.get_or_create(
                domain=domain_name,
                tenant=tenant,
                defaults={'is_primary': domain_name == '127.0.0.1'}
            )
            
            if dom_created:
                self.stdout.write(
                    self.style.SUCCESS(f'✅ Domain {domain_name} created successfully!')
                )
            else:
                self.stdout.write(f'ℹ️ Domain {domain_name} already exists')
        
        self.stdout.write(
            self.style.SUCCESS('🎉 Tenant setup completed! You can now access /admin/')
        )