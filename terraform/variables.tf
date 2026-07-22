variable "aws_region" {
  description = "AWS region where resources will be created"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Name used to identify project resources"
  type        = string
  default     = "taskapi"
}

variable "environment" {
  description = "Deployment environment"
  type        = string
  default     = "dev"
}

variable "ecr_image_retention_count" {
  description = "Number of tagged Docker images retained in ECR"
  type        = number
  default     = 10
}

variable "vpc_cidr" {
  description = "CIDR block assigned to the project VPC"
  type        = string
  default     = "10.0.0.0/16"
}