<?php

namespace Pterodactyl\Http\Controllers\Admin;

use Illuminate\View\View;
use Pterodactyl\Models\Node;
use Pterodactyl\Http\Controllers\Controller;
use Pterodactyl\Services\Helpers\SoftwareVersionService;

class BaseController extends Controller
{
    /**
     * BaseController constructor.
     */
    public function __construct(private SoftwareVersionService $version)
    {
    }

    /**
     * Return the admin index view.
     */
    public function index(): View
    {
        $nodes = Node::all();

        return view('admin.index', [
            'version' => $this->version,
            'nodes' => $nodes,
        ]);
    }
}
