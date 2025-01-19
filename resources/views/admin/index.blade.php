@extends('layouts.admin')

@section('title')
    Administration
@endsection

@section('content-header')
    <h1>Vue d'ensemble administrative<small>Un aperçu rapide de votre système.</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">Admin</a></li>
        <li class="active">Index</li>
    </ol>
@endsection

@section('content')
<div class="row">
    <div class="col-xs-12">
        <div class="box
            @if($version->isLatestPanel())
                box-success
            @else
                box-danger
            @endif
        ">
            <div class="box-header with-border">
                <h3 class="box-title">Information Système</h3>
            </div>
            <div class="box-body">
                @if ($version->isLatestPanel())
                    Vous utilisez NookTheme <code>{{ config('app.fork-version') }}</code> basé sur Pterodactyl Panel version <code>{{ config('app.version') }}</code>. Votre panel est à jour !
                @else
                    Votre panel n'est <strong>pas à jour !</strong> La dernière version est <a href="https://github.com/Nookure/NookTheme/releases/v{{ $version->getPanel() }}" target="_blank"><code>{{ $version->getPanel() }}</code></a> et vous utilisez actuellement la version <code>{{ config('app.version') }}</code>.
                @endif
            </div>
        </div>
    </div>
</div>

<!-- Monitoring des Nodes -->
<div class="row">
    <div class="col-xs-12">
        <div class="box box-primary">
            <div class="box-header with-border">
                <h3 class="box-title"><i class="fa fa-server"></i> État des Nodes</h3>
                <div class="box-tools pull-right">
                    <button type="button" class="btn btn-box-tool" data-widget="collapse"><i class="fa fa-minus"></i></button>
                </div>
            </div>
            <div class="box-body">
                <div class="row">
                    @foreach($nodes as $node)
                    <div class="col-sm-6 col-md-4">
                        <div class="info-box node-box" data-node-id="{{ $node->id }}">
                            <span class="info-box-icon bg-{{ !$node->isOnline() ? 'red' : ($node->maintenance_mode ? 'warning' : 'green') }}">
                                <i class="fa fa-server"></i>
                            </span>
                            <div class="info-box-content">
                                <span class="info-box-text">
                                    <strong>{{ $node->name }}</strong>
                                    <span class="label label-{{ !$node->isOnline() ? 'danger' : ($node->maintenance_mode ? 'warning' : 'success') }} pull-right status-text">
                                        {{ !$node->isOnline() ? 'Hors ligne' : ($node->maintenance_mode ? 'Maintenance' : 'En ligne') }}
                                    </span>
                                </span>
                                
                                @if($node->isOnline())
                                    <div class="metrics-container">
                                        <div class="metric">
                                            <span class="metric-title">RAM</span>
                                            <div class="progress">
                                                <div class="progress-bar" role="progressbar" 
                                                     style="width: {{ $node->getSystemInformation()['memory']['used_memory_percentage'] }}%">
                                                </div>
                                            </div>
                                            <span class="metric-value">
                                                {{ $node->getSystemInformation()['memory']['used'] }}/{{ $node->getSystemInformation()['memory']['total'] }} {{ $node->getSystemInformation()['memory']['unit'] }}
                                            </span>
                                        </div>

                                        <div class="metric">
                                            <span class="metric-title">CPU</span>
                                            <div class="progress">
                                                <div class="progress-bar" role="progressbar" 
                                                     style="width: {{ min($node->getSystemInformation()['cpu']['usage'], 100) }}%">
                                                </div>
                                            </div>
                                            <span class="metric-value">{{ number_format($node->getSystemInformation()['cpu']['usage'], 1) }}%</span>
                                        </div>

                                        <div class="metric">
                                            <span class="metric-title">Stockage</span>
                                            <div class="progress">
                                                <div class="progress-bar" role="progressbar" 
                                                     style="width: {{ $node->getSystemInformation()['disk']['used_percentage'] }}%">
                                                </div>
                                            </div>
                                            <span class="metric-value">
                                                {{ $node->getSystemInformation()['disk']['used'] }}/{{ $node->getSystemInformation()['disk']['total'] }} {{ $node->getSystemInformation()['disk']['unit'] }}
                                            </span>
                                        </div>
                                    </div>
                                @else
                                    <div class="offline-message">
                                        <em>Aucune donnée disponible</em>
                                    </div>
                                @endif
                            </div>
                        </div>
                    </div>
                    @endforeach
                </div>
            </div>
        </div>
    </div>
</div>

<style>
.node-box {
    transition: all 0.3s ease;
    border-radius: 5px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    margin-bottom: 20px;
}

.node-box:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

.info-box-content {
    padding: 15px;
}

.metrics-container {
    margin-top: 15px;
}

.metric {
    margin-bottom: 12px;
}

.metric-title {
    display: block;
    font-size: 12px;
    color: #666;
    margin-bottom: 4px;
}

.metric-value {
    display: block;
    font-size: 13px;
    color: #333;
    margin-top: 2px;
}

.progress {
    margin-bottom: 5px;
    height: 8px;
    border-radius: 4px;
    background-color: #f5f5f5;
    box-shadow: inset 0 1px 2px rgba(0,0,0,0.1);
}

.progress-bar {
    background-image: linear-gradient(45deg, rgba(255,255,255,.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,.15) 50%, rgba(255,255,255,.15) 75%, transparent 75%, transparent);
    background-size: 40px 40px;
    animation: progress-bar-stripes 2s linear infinite;
}

.bg-red .progress-bar { background-color: #dd4b39; }
.bg-green .progress-bar { background-color: #00a65a; }
.bg-warning .progress-bar { background-color: #f39c12; }

.offline-message {
    text-align: center;
    padding: 20px;
    color: #999;
    font-style: italic;
}

.label {
    padding: 3px 8px;
    border-radius: 3px;
    font-size: 11px;
    font-weight: normal;
}

@keyframes progress-bar-stripes {
    from { background-position: 40px 0; }
    to { background-position: 0 0; }
}
</style>

<div class="row">
    <div class="col-xs-6 col-sm-3 text-center">
        <a href="{{ $version->getDiscord() }}"><button class="btn btn-warning" style="width:100%;"><i class="fa fa-fw fa-support"></i> Obtenir de l'aide <small>(via Discord)</small></button></a>
    </div>
    <div class="col-xs-6 col-sm-3 text-center">
        <a href="https://pterodactyl.io"><button class="btn btn-primary" style="width:100%;"><i class="fa fa-fw fa-link"></i> Documentation</button></a>
    </div>
    <div class="clearfix visible-xs-block">&nbsp;</div>
    <div class="col-xs-6 col-sm-3 text-center">
        <a href="https://github.com/pterodactyl/panel"><button class="btn btn-primary" style="width:100%;"><i class="fa fa-fw fa-support"></i> Github</button></a>
    </div>
    <div class="col-xs-6 col-sm-3 text-center">
        <a href="{{ $version->getDonations() }}"><button class="btn btn-success" style="width:100%;"><i class="fa fa-fw fa-money"></i> Soutenir le projet</button></a>
    </div>
</div>
@endsection

@section('footer-scripts')
    @parent
    <script>
        // Rafraîchir les données toutes les 30 secondes
        setInterval(function() {
            $.ajax({
                url: '/admin/nodes/metrics',
                type: 'GET',
                success: function(data) {
                    data.forEach(function(nodeData) {
                        let nodeElement = $(`[data-node-id="${nodeData.id}"]`);
                        
                        // Mettre à jour le statut et la couleur
                        let statusClass, statusText;
                        // Considérer la node hors ligne si CPU = 0%
                        if (!nodeData.is_online || nodeData.cpu.usage <= 0) {
                            statusClass = 'bg-red';
                            statusText = 'Hors ligne';
                            nodeElement.find('.progress-description').html('<em>Aucune donnée disponible</em>');
                            nodeElement.find('.progress-bar').css('width', '0%');
                        } else if (nodeData.maintenance_mode) {
                            statusClass = 'bg-warning';
                            statusText = 'Maintenance';
                            updateMetrics(nodeElement, nodeData);
                        } else {
                            statusClass = 'bg-green';
                            statusText = 'En ligne';
                            updateMetrics(nodeElement, nodeData);
                        }

                        // Mettre à jour l'apparence
                        nodeElement.find('.info-box-icon')
                            .removeClass('bg-green bg-red bg-warning')
                            .addClass(statusClass);
                        nodeElement.find('.status-text').text(statusText);
                    });
                }
            });
        }, 30000);

        // Fonction pour mettre à jour les métriques
        function updateMetrics(element, data) {
            if (data.cpu.usage <= 0) {
                element.find('.progress-description').html('<em>Node arrêtée</em>');
                element.find('.progress-bar').css('width', '0%');
                return;
            }
            
            element.find('.progress-description').html(
                `RAM: ${data.memory.used} ${data.memory.unit}/${data.memory.total} ${data.memory.unit}<br>` +
                `CPU: ${data.cpu.usage.toFixed(1)}%<br>` +
                `Stockage: ${data.disk.used} ${data.disk.unit}/${data.disk.total} ${data.disk.unit}`
            );
            element.find('.progress-bar').css('width', `${data.memory.used_memory_percentage}%`);
        }
    </script>
@endsection
