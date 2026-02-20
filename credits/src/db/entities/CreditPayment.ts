import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

export type CreditPaymentType = "issue" | "repayment" | "accrual";

@Entity({ name: "credit_payments" })
export class CreditPayment {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Index()
  @Column({ name: "credit_id", type: "uuid" })
  creditId!: string;

  @Column({ type: "numeric", precision: 18, scale: 2 })
  amount!: string;

  @Column({ name: "payment_type", type: "text" })
  paymentType!: CreditPaymentType;

  @Column({ name: "performed_by", type: "text" })
  performedBy!: string;

  @Column({ name: "performed_at", type: "timestamptz" })
  performedAt!: Date;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;
}
