import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const topics = await prisma.topic.findMany({
      orderBy: [{ position: "asc" }, { createdAt: "asc" }],
    });
    return NextResponse.json(topics);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch topics" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const title = (body?.title ?? "").toString().trim();
    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const max = await prisma.topic.aggregate({ _max: { position: true } });
    const nextPosition = (max._max.position ?? 0) + 1;

    const topic = await prisma.topic.create({
      data: { title, position: nextPosition },
    });
    return NextResponse.json(topic, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create topic" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const orderedIds: string[] = Array.isArray(body?.orderedIds) ? body.orderedIds : [];
    if (!orderedIds.length) {
      return NextResponse.json({ error: "orderedIds required" }, { status: 400 });
    }

    // Use transaction to update positions
    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.topic.update({ where: { id }, data: { position: index + 1 } })
      )
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to reorder" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }

    await prisma.topic.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete topic" }, { status: 500 });
  }
}


