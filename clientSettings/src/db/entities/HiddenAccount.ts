import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  Unique,
} from "typeorm";

@Entity()
@Unique(["userId", "accountId"])
export class HiddenAccount {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Index()
  @Column({ type: "uuid" })
  userId!: string;

  @Column({ type: "text" })
  accountId!: string;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;
}
