# Production deployment / Déploiement en production

The Docker image serves React and Express from one HTTPS origin. Railway supplies TLS and routes traffic to PORT. MySQL is a separate private service.

L’image Docker sert React et Express à la même adresse HTTPS. Railway fournit TLS et transmet le trafic vers PORT. MySQL utilise un service privé distinct.

1. Connect only DHD-04/smart-task-manager to Railway / Connecter ce dépôt à Railway.
2. Add a MySQL service in the same project / Ajouter MySQL dans le même projet.
3. Set DATABASE_URL on the application to the MySQL service connection URL using a Railway reference / Renseigner DATABASE_URL par référence au service MySQL.
4. Deploy the repository Dockerfile. Migrations run before startup / Déployer le Dockerfile, les migrations précèdent le démarrage.
5. Generate an HTTPS domain for the application / Générer le domaine HTTPS.
6. Check /api/ready, register two test accounts and verify CRUD and isolation / Vérifier les comptes, tâches, projets et leur isolation.

NODE_ENV=production and HOST=0.0.0.0 are set by the Dockerfile. PORT is supplied by the host. Secrets belong in Railway variables. The application trusts one reverse proxy. Use HTTPS so the __Host-stm cookie is sent.

Les secrets sont configurés dans Railway. Le serveur fait confiance à un proxy inverse. HTTPS est requis pour le cookie sécurisé __Host-stm.

The Railway trial is limited by time and credit. Paid plans require the owner's explicit authorization. Production deployment remains pending until a public URL and database persistence are verified.
L’essai Railway est limité en durée et crédit. Une offre payante nécessite une autorisation explicite. La livraison reste en attente de vérification de l’URL publique et de la persistance en production.

## API

GET /api/auth/me, PATCH /api/auth/profile, POST /api/auth/register, POST /api/auth/login, POST /api/auth/logout.

GET and POST /api/tasks and /api/projects. GET, PATCH and DELETE /api/tasks/:id and /api/projects/:id.

GET /api/dashboard/stats?today=YYYY-MM-DD. The date is the user's local calendar date. The API validates it before calculating overdue tasks.

All task, project, dashboard and profile operations require an HTTP-only session. Authentication attempts are limited to 30 per 15 minutes per client IP.
