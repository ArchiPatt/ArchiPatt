import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

export type CreditStatus = "active" | "closed" | "defaulted";

@Entity({ name: "credits" })
export class Credit {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Index()
  @Column({ name: "client_id", type: "uuid" })
  clientId!: string;

  @Column({ name: "account_id", type: "uuid" })
  accountId!: string;

  @Column({ name: "tariff_id", type: "uuid" })
  tariffId!: string;

  @Column({ name: "principal_amount", type: "numeric", precision: 18, scale: 2 })
  principalAmount!: string;

  @Column({ name: "outstanding_amount", type: "numeric", precision: 18, scale: 2 })
  outstandingAmount!: string;

  @Column({ type: "text", default: "active" })
  status!: CreditStatus;

  @Column({ name: "issued_at", type: "timestamptz" })
  issuedAt!: Date;

  @Column({ name: "next_payment_due_at", type: "timestamptz" })
  nextPaymentDueAt!: Date;

  @Column({ name: "closed_at", type: "timestamptz", nullable: true })
  closedAt!: Date | null;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;
}
