import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm";

@Entity({ name: "user_profiles" })
export class UserProfile {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Index({ unique: true })
  @Column({ type: "text" })
  username!: string;

  @Column({ name: "display_name", type: "text", nullable: true })
  displayName!: string | null;

  @Column({ type: "text", array: true, default: () => "ARRAY[]::text[]" })
  roles!: string[];

  @Column({ name: "is_blocked", type: "boolean", default: false })
  isBlocked!: boolean;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt!: Date;
}

