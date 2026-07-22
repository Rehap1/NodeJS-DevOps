output "ecr_repository_name" {
  description = "Name of the ECR repository"
  value       = aws_ecr_repository.taskapi.name
}

output "ecr_repository_url" {
  description = "URL used to push Docker images"
  value       = aws_ecr_repository.taskapi.repository_url
}

output "aws_region" {
  description = "AWS deployment region"
  value       = var.aws_region
}