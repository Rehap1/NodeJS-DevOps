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


#eks outputs
output "eks_cluster_endpoint" {
  description = "Endpoint of the EKS Kubernetes API server"
  value       = aws_eks_cluster.main.endpoint
}

output "eks_cluster_version" {
  description = "Kubernetes version used by the EKS cluster"
  value       = aws_eks_cluster.main.version
}

output "eks_node_group_name" {
  description = "Name of the EKS managed node group"
  value       = aws_eks_node_group.main.node_group_name
}

output "eks_cluster_security_group_id" {
  description = "Security group created by EKS for the cluster"
  value       = aws_eks_cluster.main.vpc_config[0].cluster_security_group_id
}

### EBS 
output "ebs_csi_role_arn" {
  description = "IAM role used by the EBS CSI controller"
  value       = aws_iam_role.ebs_csi.arn
}

output "ebs_csi_pod_identity_association_id" {
  description = "ID of the EBS CSI Pod Identity association"
  value       = aws_eks_pod_identity_association.ebs_csi.association_id
}