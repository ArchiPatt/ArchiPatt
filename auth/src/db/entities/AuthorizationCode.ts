import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity()
export class AuthorizationCode {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Index({ unique: true })
  @Column({ type: "text" })
  code!: string;

  @Index()
  @Column({ type: "text" })
  clientId!: string;

  @Index()
  @Column({ type: "uuid" })
  userId!: string;

  @Column({ type: "timestamptz" })
  expiresAt!: Date;

  @Column({ type: "timestamptz", nullable: true })
  consumedAt!: Date | null;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;
}
