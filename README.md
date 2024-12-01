# ata-devops

## Prerequisites

- Docker v20+
- Helm v3.16+
- Terraform v1.10+
- Minikube v1.34+

## Mission 1: Terraform

1. Services required for the task below are deployed via Terraform, refer to [main.tf](./infrastructure/main.tf).
2. Configured to store the terraform state in [S3 bucket](./infrastructure/backend.tf), refer to [backend.tf](./infrastructure/terraform.tf).
3. Deploy the services.
   ```bash
   cd infrastructure
   terraform apply --auto-approve -var-file="dev.tfvars"
   ```

## Mission 2: Blockscout

1. Replace the `envFromSecret.DATABASE_URL` in [values.yml](./blockscout-stack/values.yaml) with the Postgres DB created from Terraform.
2. Start minikube cluster with addons ingress and metrics-server.
   ```bash
   minikube start
   minikube addons enable ingress
   minikube addons enable metrics-server
   ```
3. (Optional) If Prometheus Community Helm repository is not in your Helm configuration, add and update the repo.
   ```bash
   helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
   helm repo update
   ```
4. Deploy the Helm chart.
   ```bash
   # helm install <RELEASE_NAME> <CHART>
   helm install prometheus-operator prometheus-community/prometheus-operator-crds
   helm install blockscout blockscout-stack/
   ```
5. Export frontend service to access the Blockscout UI.
   ```bash
   # minikube service <RELEASE_NAME>-frontend-svc
   minikube service blockscout-frontend-svc
   ```
6. HorizontalPodAutoscaler is enabled for Blockscout deployment, refer to [blockscout-hpa.yaml](./blockscout-stack/templates/blockscout-hpa.yaml)
7. Charts release is packaged via Github [actions](./.github/workflows/release.yaml) and published on https://jackht7.github.io/ata-devops/blockscout-stack
