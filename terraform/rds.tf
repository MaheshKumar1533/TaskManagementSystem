# RDS PostgreSQL Instance Setup

# Security Group for Database
resource "aws_security_group" "db_sg" {
  name        = "${var.project_name}-db-sg"
  description = "Controls access to RDS PostgreSQL instance"
  vpc_id      = aws_vpc.main.id

  # Inbound Rule: Allow PostgreSQL connections ONLY from private app subnet (where ECS services run)
  ingress {
    description     = "PostgreSQL from ECS backend tasks"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs_tasks.id]
  }

  # Outbound Rule: Allow DB to respond
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-db-sg"
  }
}

# Amazon RDS PostgreSQL DB instance
resource "aws_db_instance" "postgres" {
  identifier             = "${var.project_name}-db"
  allocated_storage      = 20
  max_allocated_storage  = 100
  db_name                = var.db_name
  engine                 = "postgres"
  engine_version         = "15.5"
  instance_class         = "db.t4g.micro"
  username               = var.db_user
  password               = var.db_password
  db_subnet_group_name   = aws_db_subnet_group.db_group.name
  vpc_security_group_ids = [aws_security_group.db_sg.id]
  skip_final_snapshot    = true

  tags = {
    Name = "${var.project_name}-rds-instance"
  }
}
