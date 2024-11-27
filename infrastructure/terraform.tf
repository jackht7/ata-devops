terraform {
  required_providers {
    aws = {
      source = "hashicorp/aws"
      version = "~> 5.78.0"
    }
  }

  backend "s3" {
    bucket = "ata-devops"
    key    = "terraform.tfstate"
    region = "us-east-1"
    use_lockfile  = true
  }
}
