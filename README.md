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
7. Charts release is packaged via Github [actions](./.github/workflows/release.yaml) and published on https://jackht7.github.io/ata-devops/index.yaml

## Mission 3: Contract Indexer

1. Setup a Prometheus instance in Grafana Cloud.
2. Replace the Prometheus `QUERY_ENDPOINT`, `INSTANCE_ID` and `API_TOKEN` in [prometheus.yml](./contract-indexer/prometheus/prometheus.yml).
3. Replace the `INFURA_PROJECT_ID` in [docker-compose.yml](./contract-indexer/docker-compose.yml)
4. Run the indexer and Prometheus server.
   ```bash
   cd contract-indexer
   docker compose up
   ```
5. Setup the Grafana dashboard to show the metrics (`usdt_tx_count_total`, `usdt_tokens_transferred_total`) collected from [indexer](./contract-indexer/indexer.js). In the dashboard, choose the Prometheus instance as data source and set the following queries.
   ```
   rate(usdt_tx_count_total{status="success"}[$__rate_interval])
   rate(usdt_tokens_transferred_total{status="success"}[$__rate_interval])
   ```
   Example dashboard:
   ![dashboard](./misc/indexer.png)
6. Create an alert rule that check if the metric,`usdt_tokens_transferred_total_in_one_transaction`, the total USDT tokens transferred in one transaction greater than 1 million.
   ```
   sum(usdt_tokens_transferred_total_in_one_transaction) by (transactionHash) > 1000000
   ```
