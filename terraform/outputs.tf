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


output "vpc_id" {
  description = "ID of the project VPC"
  value       = aws_vpc.main.id
}

output "public_subnet_ids" {
  description = "IDs of public subnets used by external load balancers"
  value       = values(aws_subnet.public)[*].id
}

output "private_subnet_ids" {
  description = "IDs of private subnets used by EKS worker nodes"
  value       = values(aws_subnet.private)[*].id
}

output "nat_gateway_public_ip" {
  description = "Public IP address assigned to the NAT Gateway"
  value       = aws_eip.nat.public_ip
}

output "eks_cluster_name" {
  description = "Name reserved for the future EKS cluster"
  value       = local.cluster_name
}