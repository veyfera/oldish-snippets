# Generated by Django 3.2.23 on 2023-12-22 12:04

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('payments', '0002_auto_20231222_0947'),
    ]

    operations = [
        migrations.AddField(
            model_name='item',
            name='currency',
            field=models.CharField(default='usd', max_length=4),
        ),
    ]
