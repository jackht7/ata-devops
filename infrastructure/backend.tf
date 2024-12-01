resource "aws_s3_bucket" "bucket" {
  bucket              = "ata-devops"
  object_lock_enabled = true
  tags = {
    Name  = "Terraform S3 Backend"
    Stack = "Ata-DevOps"
  }
}

resource "aws_s3_bucket_versioning" "bucket_versioning" {
  bucket = aws_s3_bucket.bucket.id

  versioning_configuration {
    status = "Enabled"
  }
}
