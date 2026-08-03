<?php

namespace App\Http\Controllers\api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTodoRequest;
use App\Http\Requests\UpdateTodoRequest;
use App\Http\Resources\TodoResource;
use App\Models\Todo;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response as HttpResponse;
use Illuminate\Support\Facades\Gate;
use Symfony\Component\HttpFoundation\Response;

class TodoController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        Gate::authorize('viewAny', Todo::class);

        /** @var User $user */
        $user = $request->user();

        return TodoResource::collection($user->todos()->latest()->get());
    }

    public function store(StoreTodoRequest $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $todo = $user->todos()->create($request->validated());

        return (new TodoResource($todo))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }

    public function show(Todo $todo): TodoResource
    {
        Gate::authorize('view', $todo);

        return new TodoResource($todo);
    }

    public function update(UpdateTodoRequest $request, Todo $todo): TodoResource
    {
        $todo->update($request->validated());

        return new TodoResource($todo->refresh());
    }

    public function destroy(Todo $todo): HttpResponse
    {
        Gate::authorize('delete', $todo);

        $todo->delete();

        return response()->noContent();
    }
}
