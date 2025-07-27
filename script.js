// Espera o DOM carregar antes de rodar qualquer coisa
document.addEventListener('DOMContentLoaded', () => {
    // Referências dos elementos HTML
    const inputFile = document.getElementById('imageInput');
    const fileName = document.getElementById('fileName');
    const previewContainer = document.getElementById('previewContainer');
    const previewImage = document.getElementById('previewImage');
    const removeImageBtn = document.getElementById('removeImageBtn');
    const resultDiv = document.getElementById('result');
    const outputImage = document.getElementById('outputImage');
    const downloadBtn = document.getElementById('downloadBtn');
    const dropZone = document.getElementById('dropZone');

    // Atualiza o nome e mostra a prévia da imagem ao selecionar
    inputFile.addEventListener('change', () => {
        if (inputFile.files.length > 0) {
            const file = inputFile.files[0];
            fileName.textContent = file.name;
            previewImage.src = URL.createObjectURL(file);
            previewContainer.style.display = 'block';

            showToast('✅ Imagem carregada com sucesso!');
        } else {
            resetPreview();
        }
    });

    // Botão de remover imagem
    removeImageBtn.addEventListener('click', () => {
        inputFile.value = '';
        resetPreview();
    });

    // Drag & Drop
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            inputFile.files = files;
            const event = new Event('change'); // Gatilho manual
            inputFile.dispatchEvent(event);   // Dispara evento change pra atualizar preview
        }
    });

    // Função para resetar visualização e estado
    function resetPreview() {
        fileName.textContent = 'Nenhum arquivo selecionado';
        previewImage.src = '';
        previewContainer.style.display = 'none';
        resultDiv.style.display = 'none';
        outputImage.src = '';
        downloadBtn.style.display = 'none';
    }
});

// Toast simples estilo notificação
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;

    // Estilo baseado no tipo
    switch (type) {
        case 'error':
            toast.style.backgroundColor = '#e74c3c';
            break;
        case 'warning':
            toast.style.backgroundColor = '#f39c12';
            break;
        default:
            toast.style.backgroundColor = '#00aa55';
    }

    // Exibe
    toast.classList.add('show');

    // Esconde depois de 3 segundos
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Remover fundo da imagem usando API
function removerfundo() {
    const input = document.getElementById('imageInput');

    if (!input.files || input.files.length === 0) {
        Swal.fire({
            icon: 'warning',
            title: 'Nenhuma imagem selecionada!',
            text: 'Por favor, selecione uma imagem para continuar.'
        });
        return;
    }

    const file = input.files[0];
    const formData = new FormData();
    formData.append('image_file', file);
    formData.append('size', 'auto');

    Swal.fire({
        title: 'Removendo fundo...',
        text: 'Aguarde enquanto processamos sua imagem.',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
    });

    fetch('https://api.remove.bg/v1.0/removebg', {
        method: 'POST',
        headers: {
            'X-Api-Key': 'i8NM46tppdHdRgZwtxsSxGmF' // Sua chave de API aqui
        },
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Erro ao remover fundo: ${response.statusText}`);
        }
        return response.blob();
    })
    .then(blob => {
        Swal.close();
        Swal.fire({
            icon: 'success',
            title: 'Sucesso!',
            text: 'Fundo da imagem removido com sucesso!'
        });

        const url = URL.createObjectURL(blob);
        const outputImage = document.getElementById('outputImage');
        const resultDiv = document.getElementById('result');
        const downloadBtn = document.getElementById('downloadBtn');

        outputImage.src = url;
        resultDiv.style.display = 'block';
        downloadBtn.href = url;
        downloadBtn.style.display = 'inline-block';
    })
    .catch(error => {
        console.error('Erro:', error);
        Swal.fire({
            icon: 'error',
            title: 'Erro!',
            text: 'Não foi possível remover o fundo da imagem.',
            footer: 'Verifique se a imagem é válida ou se a API está funcionando.'
        });
    });
}
