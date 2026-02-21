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

  @Column({ type: "text" })
  redirectUri!: string;

  @Column({ type: "text", array: true })
  scopes!: string[];

  @Column({ type: "text" })
  codeChallenge!: string;

  @Column({ type: "text" })
  codeChallengeMethod!: "S256";

  @Column({ type: "text", nullable: true })
  nonce!: string | null;

  @Column({ type: "timestamptz" })
  expiresAt!: Date;

  @Column({ type: "timestamptz", nullable: true })
  consumedAt!: Date | null;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;
}
