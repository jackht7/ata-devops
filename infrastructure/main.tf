resource "aws_security_group" "rds_sg" {
  name        = "blockscout-rds-security-group"
  description = "Allow access to RDS instance"

  # NOT for production use
  # Restrict to VPC CIDR
  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name  = "RDS Security Group for Blockscout"
    Stack = "Ata-DevOps"
  }
}

# NOT for production use
# Get username and password from Secrets Manager
# Set publicly_accessible to false
resource "aws_db_instance" "ata-devops" {
  identifier              = "ata-devops"
  instance_class          = "db.t3.micro"
  engine                  = "postgres"
  engine_version          = "13.12"
  username                = "postgres"
  password                = "postgres"
  db_name                 = "blockscout"
  allocated_storage       = 20
  storage_type            = "gp2"
  publicly_accessible     = true
  vpc_security_group_ids  = [aws_security_group.rds_sg.id]
  multi_az                = false
  backup_retention_period = 7

  tags = {
    Name  = "Database for Blockscout"
    Stack = "Ata-DevOps"
  }
}
