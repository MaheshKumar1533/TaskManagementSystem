variable "aws_region" {
  description = "AWS deployment region"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project name tag"
  type        = string
  default     = "tasksphere"
}

variable "db_name" {
  description = "Database name for PostgreSQL"
  type        = string
  default     = "tasksphere"
}

variable "db_user" {
  description = "Database root user"
  type        = string
  default     = "postgres"
}

variable "db_password" {
  description = "Database root password"
  type        = string
  default     = "ProductionDbSecurePassword!"
  sensitive   = true
}

variable "backend_port" {
  description = "Inbound Port on Backend container"
  type        = number
  default     = 8000
}
