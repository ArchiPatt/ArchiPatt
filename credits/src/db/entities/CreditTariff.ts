import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "credit_tariffs" })
export class CreditTariff {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Index({ unique: true })
  @Column({ type: "text" })
  name!: string;

  @Column({ name: "interest_rate", type: "numeric", precision: 10, scale: 4 })
  interestRate!: string;

  @Column({ name: "billing_period_days", type: "integer", default: 1 })
  billingPeriodDays!: number;

  @Column({ name: "is_active", type: "boolean", default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;
}
