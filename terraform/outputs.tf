output "alb_dns_name" {
  description = "Public URL of Application Load Balancer"
  value       = aws_lb.main.dns_name
}

output "rds_endpoint" {
  description = "Database connection endpoint"
  value       = aws_db_instance.postgres.endpoint
}

output "ecr_backend_url" {
  description = "ECR Repository URL for Backend"
  value       = aws_ecr_repository.backend.repository_url
}

output "ecr_frontend_url" {
  description = "ECR Repository URL for Frontend"
  value       = aws_ecr_repository.frontend.repository_url
}
