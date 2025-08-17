import {
    MemberSchema,
    Member,
    MemberCreate,
    MemberUpdate,
    MemberCreateSchema,
    MemberUpdateSchema,
} from '@/schemas/member.schema';
import { prismaPostgres } from '@/../prisma';

class MemberModel {
    // Convert potential DB nulls -> undefined only for optional fields
    private mapNulls(m: any): Member {
        return {
            ...m,
            instagram_link: m.instagram_link ?? undefined,
            website_link: m.website_link ?? undefined,
            expertise: m.expertise ?? undefined,
            blogs: m.blogs ?? undefined,
            deletedAt: m.deletedAt ?? undefined,
        };
    }

    async GetAllMembers(): Promise<Member[]> {
        try {
            // include blogs if you want relations loaded; remove include if not desired
            const members = await prismaPostgres.member.findMany({
                include: { blogs: true },
            });

            return members.map((m) => this.mapNulls(m));
        } catch (error) {
            console.error('Error fetching all members:', error);
            throw new Error('Failed to fetch members');
        }
    }

    async GetMember(id: string): Promise<Member | null> {
        try {
            const member = await prismaPostgres.member.findUnique({
                where: { id },
                include: { blogs: true },
            });
            return member ? this.mapNulls(member) : null;
        } catch (error) {
            console.error(`Error fetching member with id ${id}:`, error);
            throw new Error('Failed to fetch member');
        }
    }

    // Accept a Create-type input
    async CreateMember(member: MemberCreate): Promise<Member> {
        try {
            // Validate input (ensures only allowed fields)
            const parsed = MemberCreateSchema.parse(member);

            const newMember = await prismaPostgres.member.create({
                data: parsed,
            });

            return this.mapNulls(newMember);
        } catch (error) {
            console.error('Error creating member:', error);
            throw new Error('Failed to create member');
        }
    }

    // Accept Update-type input; requires id
    async UpdateMember(member: MemberUpdate & { id: string }): Promise<Member> {
        try {
            if (!member.id) throw new Error('Member ID is required for update');

            // Validate update payload (partial)
            const parsed = MemberUpdateSchema.parse(member);

            // Ensure we do not attempt to update the id itself
            const { id, ...data } = parsed as any;

            const updatedMember = await prismaPostgres.member.update({
                where: { id: member.id },
                data,
            });

            return this.mapNulls(updatedMember);
        } catch (error) {
            console.error(`Error updating member with id ${member.id}:`, error);
            throw new Error('Failed to update member');
        }
    }

    async DeleteMember(id: string): Promise<boolean> {
        try {
            await prismaPostgres.member.delete({
                where: { id },
            });
            return true;
        } catch (error) {
            console.error(`Error deleting member with id ${id}:`, error);
            throw new Error('Failed to delete member');
        }
    }
}

export default new MemberModel();
