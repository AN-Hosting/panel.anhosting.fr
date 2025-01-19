<?php

namespace Pterodactyl\Models;

use Illuminate\Support\Str;
use Symfony\Component\Yaml\Yaml;
use Illuminate\Container\Container;
use Illuminate\Notifications\Notifiable;
use Illuminate\Contracts\Encryption\Encrypter;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

/**
 * @property int $id
 * @property string $uuid
 * @property bool $public
 * @property string $name
 * @property string|null $description
 * @property int $location_id
 * @property string $fqdn
 * @property string $scheme
 * @property bool $behind_proxy
 * @property bool $maintenance_mode
 * @property int $memory
 * @property int $memory_overallocate
 * @property int $disk
 * @property int $disk_overallocate
 * @property int $upload_size
 * @property string $daemon_token_id
 * @property string $daemon_token
 * @property int $daemonListen
 * @property int $daemonSFTP
 * @property string $daemonBase
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 * @property \Pterodactyl\Models\Location $location
 * @property \Pterodactyl\Models\Mount[]|\Illuminate\Database\Eloquent\Collection $mounts
 * @property \Pterodactyl\Models\Server[]|\Illuminate\Database\Eloquent\Collection $servers
 * @property \Pterodactyl\Models\Allocation[]|\Illuminate\Database\Eloquent\Collection $allocations
 */
class Node extends Model
{
    use Notifiable;

    /**
     * The resource name for this model when it is transformed into an
     * API representation using fractal.
     */
    public const RESOURCE_NAME = 'node';

    public const DAEMON_TOKEN_ID_LENGTH = 16;
    public const DAEMON_TOKEN_LENGTH = 64;

    /**
     * The table associated with the model.
     */
    protected $table = 'nodes';

    /**
     * The attributes excluded from the model's JSON form.
     */
    protected $hidden = ['daemon_token_id', 'daemon_token'];

    /**
     * Cast values to correct type.
     */
    protected $casts = [
        'location_id' => 'integer',
        'memory' => 'integer',
        'disk' => 'integer',
        'daemonListen' => 'integer',
        'daemonSFTP' => 'integer',
        'behind_proxy' => 'boolean',
        'public' => 'boolean',
        'maintenance_mode' => 'boolean',
    ];

    /**
     * Fields that are mass assignable.
     */
    protected $fillable = [
        'public', 'name', 'location_id',
        'fqdn', 'scheme', 'behind_proxy',
        'memory', 'memory_overallocate', 'disk',
        'disk_overallocate', 'upload_size', 'daemonBase',
        'daemonSFTP', 'daemonListen',
        'description', 'maintenance_mode',
    ];

    public static array $validationRules = [
        'name' => 'required|regex:/^([\w .-]{1,100})$/',
        'description' => 'string|nullable',
        'location_id' => 'required|exists:locations,id',
        'public' => 'boolean',
        'fqdn' => 'required|string',
        'scheme' => 'required',
        'behind_proxy' => 'boolean',
        'memory' => 'required|numeric|min:1',
        'memory_overallocate' => 'required|numeric|min:-1',
        'disk' => 'required|numeric|min:1',
        'disk_overallocate' => 'required|numeric|min:-1',
        'daemonBase' => 'sometimes|required|regex:/^([\/][\d\w.\-\/]+)$/',
        'daemonSFTP' => 'required|numeric|between:1,65535',
        'daemonListen' => 'required|numeric|between:1,65535',
        'maintenance_mode' => 'boolean',
        'upload_size' => 'int|between:1,1024',
    ];

    /**
     * Default values for specific columns that are generally not changed on base installs.
     */
    protected $attributes = [
        'public' => true,
        'behind_proxy' => false,
        'memory_overallocate' => 0,
        'disk_overallocate' => 0,
        'daemonBase' => '/var/lib/pterodactyl/volumes',
        'daemonSFTP' => 2022,
        'daemonListen' => 8080,
        'maintenance_mode' => false,
    ];

    /**
     * Get the connection address to use when making calls to this node.
     */
    public function getConnectionAddress(): string
    {
        return sprintf('%s://%s:%s', $this->scheme, $this->fqdn, $this->daemonListen);
    }

    /**
     * Returns the configuration as an array.
     */
    public function getConfiguration(): array
    {
        return [
            'debug' => false,
            'uuid' => $this->uuid,
            'token_id' => $this->daemon_token_id,
            'token' => Container::getInstance()->make(Encrypter::class)->decrypt($this->daemon_token),
            'api' => [
                'host' => '0.0.0.0',
                'port' => $this->daemonListen,
                'ssl' => [
                    'enabled' => (!$this->behind_proxy && $this->scheme === 'https'),
                    'cert' => '/etc/letsencrypt/live/' . Str::lower($this->fqdn) . '/fullchain.pem',
                    'key' => '/etc/letsencrypt/live/' . Str::lower($this->fqdn) . '/privkey.pem',
                ],
                'upload_limit' => $this->upload_size,
            ],
            'system' => [
                'data' => $this->daemonBase,
                'sftp' => [
                    'bind_port' => $this->daemonSFTP,
                ],
            ],
            'allowed_mounts' => $this->mounts->pluck('source')->toArray(),
            'remote' => route('index'),
        ];
    }

    /**
     * Returns the configuration in Yaml format.
     */
    public function getYamlConfiguration(): string
    {
        return Yaml::dump($this->getConfiguration(), 4, 2, Yaml::DUMP_EMPTY_ARRAY_AS_SEQUENCE);
    }

    /**
     * Returns the configuration in JSON format.
     */
    public function getJsonConfiguration(bool $pretty = false): string
    {
        return json_encode($this->getConfiguration(), $pretty ? JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT : JSON_UNESCAPED_SLASHES);
    }

    /**
     * Helper function to return the decrypted key for a node.
     */
    public function getDecryptedKey(): string
    {
        return (string) Container::getInstance()->make(Encrypter::class)->decrypt(
            $this->daemon_token
        );
    }

    public function isUnderMaintenance(): bool
    {
        return $this->maintenance_mode;
    }

    public function mounts(): HasManyThrough
    {
        return $this->hasManyThrough(Mount::class, MountNode::class, 'node_id', 'id', 'id', 'mount_id');
    }

    /**
     * Gets the location associated with a node.
     */
    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }

    /**
     * Gets the servers associated with a node.
     */
    public function servers(): HasMany
    {
        return $this->hasMany(Server::class);
    }

    /**
     * Gets the allocations associated with a node.
     */
    public function allocations(): HasMany
    {
        return $this->hasMany(Allocation::class);
    }

    /**
     * Returns a boolean if the node is viable for an additional server to be placed on it.
     */
    public function isViable(int $memory, int $disk): bool
    {
        $memoryLimit = $this->memory * (1 + ($this->memory_overallocate / 100));
        $diskLimit = $this->disk * (1 + ($this->disk_overallocate / 100));

        return ($this->sum_memory + $memory) <= $memoryLimit && ($this->sum_disk + $disk) <= $diskLimit;
    }

    /**
     * Vérifie si le node est en ligne en essayant de récupérer les informations système
     */
    public function isOnline(): bool
    {
        try {
            $systemInfo = $this->getSystemInformation();
            // Une node est considérée hors ligne si son CPU est à 0%
            return !empty($systemInfo) && $systemInfo['cpu']['usage'] > 0;
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Récupère les informations système du node de manière sécurisée
     */
    public function getSystemInformation(): array
    {
        try {
            $client = new \GuzzleHttp\Client();
            $response = $client->request('GET', $this->getConnectionAddress() . '/api/servers', [
                'headers' => [
                    'Authorization' => 'Bearer ' . $this->getDecryptedKey(),
                ],
                'timeout' => 5,
                'verify' => false,
            ]);

            $data = json_decode($response->getBody(), true);
            
            // Debug - Afficher les données reçues dans le log
            \Log::debug('Données reçues du node:', [
                'node_id' => $this->id,
                'node_name' => $this->name,
                'data' => $data,
            ]);

            // Calculer l'utilisation totale
            $totalMemory = $this->memory * 1024 * 1024; // Convertir en bytes
            $usedMemory = 0;
            $cpuUsage = 0;
            $diskUsage = 0;
            $totalDisk = 0;

            foreach ($data as $server) {
                if (isset($server['utilization'])) {
                    $usedMemory += $server['utilization']['memory_bytes'] ?? 0;
                    $cpuUsage += $server['utilization']['cpu_absolute'] ?? 0;
                    $diskUsage += $server['utilization']['disk_bytes'] ?? 0;
                }
                if (isset($server['configuration']['build'])) {
                    $totalDisk += ($server['configuration']['build']['disk_space'] ?? 0) * 1024 * 1024;
                }
            }

            // Convertir les bytes en Go
            $totalMemoryGB = round($totalMemory / 1024 / 1024 / 1024, 2);
            $usedMemoryGB = round($usedMemory / 1024 / 1024 / 1024, 2);
            $totalDiskGB = round($totalDisk / 1024 / 1024 / 1024, 2);
            $usedDiskGB = round($diskUsage / 1024 / 1024 / 1024, 2);

            return [
                'memory' => [
                    'total' => $totalMemoryGB,
                    'used' => $usedMemoryGB,
                    'used_memory_percentage' => $totalMemory > 0 ? round(($usedMemory / $totalMemory) * 100, 2) : 0,
                    'unit' => 'Go'
                ],
                'cpu' => [
                    'usage' => round($cpuUsage, 2),
                ],
                'disk' => [
                    'total' => $totalDiskGB,
                    'used' => $usedDiskGB,
                    'used_percentage' => $totalDisk > 0 ? round(($diskUsage / $totalDisk) * 100, 2) : 0,
                    'unit' => 'Go'
                ],
            ];
        } catch (\Exception $e) {
            if (config('app.debug')) {
                \Log::debug('Erreur détaillée du node:', [
                    'node_id' => $this->id,
                    'node_name' => $this->name,
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                    'url' => $this->getConnectionAddress() . '/api/servers',
                ]);
            }

            return [
                'memory' => [
                    'total' => 0,
                    'used' => 0,
                    'used_memory_percentage' => 0,
                    'unit' => 'Go'
                ],
                'cpu' => [
                    'usage' => 0,
                ],
                'disk' => [
                    'total' => 0,
                    'used' => 0,
                    'used_percentage' => 0,
                    'unit' => 'Go'
                ],
            ];
        }
    }
}
